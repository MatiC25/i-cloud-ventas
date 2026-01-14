import { useState, useEffect, useRef } from 'react';
import { getTodaysTasks, ITask } from '../services/taskService';
import { toast } from 'sonner';

export const useTaskPolling = (intervalMs = 30000) => {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [lastCount, setLastCount] = useState<number>(0);
    const isFirstRun = useRef(true);

    const fetchTasks = async () => {
        try {
            const todaysTasks = await getTodaysTasks();
            setTasks(todaysTasks);

            // Check for new tasks to notify
            // Check for new tasks to notify (only count pending ones for notification)
            const pendingCount = todaysTasks.filter(t => t.Estado === 'Pendiente').length;
            if (!isFirstRun.current && pendingCount > lastCount) {
                toast.info("🔔 Nueva tarea asignada", {
                    description: "Se ha agregado una nueva tarea a la lista."
                });
            }

            setLastCount(pendingCount);
            isFirstRun.current = false;
        } catch (error) {
            console.error("Error polling tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks(); // Initial fetch

        const interval = setInterval(fetchTasks, intervalMs);
        return () => clearInterval(interval);
    }, [intervalMs, lastCount]); // Re-create interval if needed, but usually stable

    return { tasks, refreshTasks: fetchTasks };
};
