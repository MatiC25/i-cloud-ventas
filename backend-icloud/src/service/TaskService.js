class TaskService {
    constructor() {
        this.repository = new TaskRepository();
    }

    createTask(payload) {
        // Validate payload
        if (!payload.Descripcion) throw new Error("La descripción es obligatoria");

        const task = {
            Descripcion: payload.Descripcion,
            Fecha_Objetivo: payload.Fecha_Objetivo, // Expecting ISO string or Date
            Cliente: payload.Cliente || "General",
            Prioridad: payload.Prioridad || "Media",
            Creado_Por: payload.Creado_Por || "Sistema"
        };

        return this.repository.create(task);
    }

    getPendingTasks() {
        return this.repository.findPending();
    }

    getTodaysTasks() {
        return this.repository.findTodaysTasks();
    }

    completeTask(id) {
        if (!id) throw new Error("Se requiere el ID de la tarea");
        return this.repository.complete(id);
    }

    reactivateTask(id) {
        if (!id) throw new Error("Se requiere el ID de la tarea");
        return this.repository.reactivate(id);
    }

    deleteTask(id) {
        if (!id) throw new Error("Se requiere el ID de la tarea");
        return this.repository.delete(id);
    }
}
