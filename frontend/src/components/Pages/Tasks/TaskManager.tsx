import React, { useState } from 'react';
import { useTaskPolling } from '@/hooks/useTaskPolling';
import { createTask, completeTask, reactivateTask, deleteTask } from '@/services/taskService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Check, Clock, Briefcase, Play } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export const TaskManager: React.FC = () => {
    const { tasks, refreshTasks } = useTaskPolling(); // Polls every 30s
    const [loading, setLoading] = useState(false);

    // Optimistic State Sets
    const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<Set<string>>(new Set());
    const [optimisticPendingIds, setOptimisticPendingIds] = useState<Set<string>>(new Set());

    // Form State
    const [taskDesc, setTaskDesc] = useState('');
    const [clientName, setClientName] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [taskTime, setTaskTime] = useState('');

    const todayStr = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

    // Merged Tasks: Real API tasks + Optimistic overrides
    const displayTasks = tasks.map(t => {
        // If in optimistic completed -> FORCE Complete
        if (optimisticCompletedIds.has(t.ID!)) {
            return { ...t, Estado: 'Completada' as const };
        }
        // If in optimistic pending -> FORCE Pending
        if (optimisticPendingIds.has(t.ID!)) {
            return { ...t, Estado: 'Pendiente' as const };
        }
        return t;
    }).sort((a, b) => new Date(a.Fecha_Objetivo).getTime() - new Date(b.Fecha_Objetivo).getTime());

    const pendingCount = displayTasks.filter(t => t.Estado === 'Pendiente').length;
    const completedCount = displayTasks.filter(t => t.Estado === 'Completada').length;
    const totalCount = displayTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskDesc) {
            toast.error("La descripción es obligatoria");
            return;
        }

        setLoading(true);
        try {
            let targetDateTime: Date;
            if (taskDate && taskTime) {
                targetDateTime = new Date(`${taskDate}T${taskTime}`);
            } else if (taskTime) {
                const today = new Date();
                const [hours, minutes] = taskTime.split(':');
                targetDateTime = new Date(today.setHours(parseInt(hours), parseInt(minutes), 0, 0));
            } else {
                targetDateTime = new Date();
            }

            await createTask({
                Descripcion: taskDesc,
                Fecha_Objetivo: targetDateTime.toISOString(),
                Cliente: clientName || "General"
            });

            toast.success("Tarea agregada");
            setTaskDesc('');
            setClientName('');
            setTaskDate('');
            setTaskTime('');
            refreshTasks(); // Refresh to see new task
        } catch (error) {
            toast.error("Error al crear tarea");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = (task: any) => {
        if (!task.ID) return;
        const isCurrentlyCompleted = task.Estado === 'Completada';

        if (isCurrentlyCompleted) {
            // REACTIVATE
            // 1. Optimistic
            setOptimisticPendingIds(prev => new Set(prev).add(task.ID));
            setOptimisticCompletedIds(prev => {
                const next = new Set(prev);
                next.delete(task.ID);
                return next;
            });
            toast.info("Tarea reactivada");

            // 2. Async Call
            reactivateTask(task.ID).then(() => {
                refreshTasks();
            }).catch(() => {
                toast.error("Error al reactivar");
                setOptimisticPendingIds(prev => {
                    const next = new Set(prev);
                    next.delete(task.ID);
                    return next;
                });
            });

        } else {
            // COMPLETE
            // 1. Optimistic
            setOptimisticCompletedIds(prev => new Set(prev).add(task.ID));
            setOptimisticPendingIds(prev => {
                const next = new Set(prev);
                next.delete(task.ID);
                return next;
            });
            toast.success("Tarea completada");

            // 2. Async Call
            completeTask(task.ID).then(() => {
                refreshTasks();
            }).catch(() => {
                toast.error("Error al completar");
                setOptimisticCompletedIds(prev => {
                    const next = new Set(prev);
                    next.delete(task.ID);
                    return next;
                });
            });
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;

        try {
            await deleteTask(id);
            toast.success("Tarea eliminada permanentemente");
            refreshTasks();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar la tarea");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">

            {/* Header & Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h1 className="text-4xl font-extrabold tracking-tight capitalize mb-1">{todayStr}</h1>
                    <p className="text-muted-foreground text-lg">Hoja de Ruta del Día</p>
                </div>

                <Card className="bg-card/50 border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Progreso Diario</span>
                            <span className="text-2xl font-bold">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2 mb-2" />
                        <div className="text-xs text-muted-foreground text-right">
                            {completedCount} / {totalCount} Completadas
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Add Form */}
            <Card className="border-border shadow-sm bg-secondary/5">
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Nueva Tarea</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Cliente..."
                                    className="bg-background flex-[1]"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                />
                                <Input
                                    placeholder="Descripción..."
                                    className="bg-background flex-[2]"
                                    value={taskDesc}
                                    onChange={(e) => setTaskDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex gap-2">
                            <Input
                                type="time"
                                className="bg-background w-24"
                                value={taskTime}
                                onChange={(e) => setTaskTime(e.target.value)}
                            />
                            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground min-w-[100px]">
                                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Timeline View */}
            <div className="mt-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[85px] top-4 bottom-4 w-px bg-border hidden md:block" />

                <div className="space-y-6">
                    {displayTasks.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No hay tareas programadas para hoy.</p>
                        </div>
                    ) : (
                        displayTasks.map((task, index) => {
                            const isCompleted = task.Estado === 'Completada';
                            const dateObj = new Date(task.Fecha_Objetivo);
                            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            const now = new Date();
                            const isPast = dateObj < now;
                            const isNext = !isCompleted && !isPast && (index === 0 || new Date(displayTasks[index - 1].Fecha_Objetivo) < now);

                            return (
                                <div key={task.ID || index} className="relative flex flex-col md:flex-row gap-4 md:gap-8 group">

                                    {/* Time Column */}
                                    <div className="hidden md:flex flex-col items-end w-[60px] pt-4 text-right">
                                        <span className={`text-sm font-bold ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {timeStr}
                                        </span>
                                    </div>

                                    {/* Timeline Node */}
                                    <div className="hidden md:flex flex-col items-center pt-4 z-10">
                                        <div
                                            onClick={() => handleToggleStatus(task)}
                                            className={`
                                            cursor-pointer rounded-full flex items-center justify-center transition-all duration-300
                                            ${isCompleted
                                                    ? 'w-8 h-8 bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30'
                                                    : isNext
                                                        ? 'w-10 h-10 bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-110 hover:bg-blue-700'
                                                        : 'w-4 h-4 bg-secondary border-2 border-muted-foreground/30 mt-2 hover:border-blue-500'
                                                }
                                        `}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : isNext ? (
                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Task Card */}
                                    <div className="flex-1">
                                        <Card className={`
                                            transition-all duration-300 border-l-4
                                            ${isCompleted
                                                ? 'bg-secondary/20 border-l-green-500/50 opacity-60'
                                                : isNext
                                                    ? 'bg-card border-l-blue-500 shadow-md scale-[1.01]'
                                                    : 'bg-card border-l-muted-foreground/30 hover:border-l-blue-400'
                                            }
                                        `}>
                                            <CardContent className="p-4 flex items-center gap-4">
                                                {/* Checkbox (Mobile priority / Quick action) */}
                                                <button
                                                    onClick={() => handleToggleStatus(task)}
                                                    className={`
                                                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                                        ${isCompleted
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-muted-foreground hover:border-blue-500'
                                                        }
                                                    `}
                                                >
                                                    {isCompleted && <Check className="w-3 h-3 text-white" />}
                                                </button>

                                                <div className="flex-1 min-w-0 pointer-events-none">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className={`font-bold text-base truncate pr-2 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                            {task.Cliente || "Cliente General"}
                                                        </h3>
                                                        <span className="md:hidden text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                            {timeStr}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm mt-1 break-words ${isCompleted ? 'line-through text-muted-foreground/80' : 'text-muted-foreground'}`}>
                                                        {task.Descripcion}
                                                    </p>

                                                    {!isCompleted && isNext && (
                                                        <div className="mt-3 flex items-center gap-2 pointer-events-auto">
                                                            <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => handleToggleStatus(task)}>
                                                                Completar ahora
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 items-end">
                                                    <Badge variant="outline" className="hidden sm:inline-flex opacity-50">
                                                        {task.Prioridad || 'Normal'}
                                                    </Badge>

                                                    {/* Delete Button */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. La tarea se eliminará permanentemente.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(task.ID)} className="bg-red-600 hover:bg-red-700 text-white">
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
