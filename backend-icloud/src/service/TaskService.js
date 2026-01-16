

class TaskService {
    constructor() {
        this.repository = new TaskRepository();
    }

    static createTask(payload) {
        const id = Utilities.getUuid();
        const fecha = new Date().toISOString();

        const nuevaFila = {
            id: id,
            tipo: payload.tipo || "General",
            cliente: payload.cliente || "",
            descripcion: payload.descripcion,
            link: payload.link || "",
            estado: "Pendiente",
            is_deleted: false,
            created_at: fecha,
            auditoria: payload.auditoria
        };

        const taskRepo = new TaskRepository();
        taskRepo._getSheet();
        return taskRepo.save(nuevaFila);
    }

    static updateTask(payload) {
        const ss = getDB();
        const sheet = ss.getSheetByName("Tareas");

        const data = sheet.getDataRange().getValues();
        const headers = data.shift();
        const rowIndex = data.findIndex(row => row[0] === payload.id);

        if (rowIndex === -1) {
            throw new Error(`No se encontró la tarea con ID: ${payload.id}`);
        }

        const updatedRow = headers.map(header => {
            // Si la columna existe en el payload, usamos su valor, si no, dejamos el valor original
            return payload.hasOwnProperty(header) ? payload[header] : data[rowIndex][headers.indexOf(header)];
        });

        sheet.getRange(rowIndex + 2, 1, 1, updatedRow.length).setValues([updatedRow]);

        return { status: "success", message: "Tarea actualizada" };
    }

    static deleteTask(id) {
        const ss = getDB();
        const sheet = ss.getSheetByName("Tareas");

        const data = sheet.getDataRange().getValues();
        const headers = data.shift();

        const rowIndex = data.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            throw new Error(`No se encontró la tarea con ID: ${id}`);
        }

        const isDeletedColIndex = headers.indexOf("is_deleted");

        if (isDeletedColIndex === -1) {
            throw new Error("No existe la columna is_deleted");
        }

        sheet
            .getRange(rowIndex + 2, isDeletedColIndex + 1)
            .setValue(true);

        return { status: "success", message: "Tarea eliminada" };
    }

    static getTasks() {
        const ss = getDB();
        const sheet = ss.getSheetByName("Tareas");

        const data = sheet.getDataRange().getValues();
        const headers = data.shift();

        const tareas = data.map(row => {
            let obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            return obj;
        })
            .filter(t => t.is_deleted !== true && t.is_deleted !== "true")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return tareas;
    }
}
