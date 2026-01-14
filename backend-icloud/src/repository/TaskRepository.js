class TaskRepository {
    constructor() {
        this.sheetName = "Tasks";
    }

    _getSheet() {
        const ss = getDB();
        let sheet = ss.getSheetByName(this.sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(this.sheetName);
            sheet.appendRow(TaskMapper.getHeaders());
            // Set header format
            sheet.getRange(1, 1, 1, TaskMapper.getHeaders().length).setFontWeight("bold");
        }
        return sheet;
    }

    findAll() {
        const sheet = this._getSheet();
        const data = sheet.getDataRange().getValues();
        if (data.length < 2) return [];

        const rows = data.slice(1);
        return rows.map(row => TaskMapper.toDTO(row));
    }

    findPending() {
        const all = this.findAll();
        // Filter only "Pendiente" and sort by Date (Fecha_Objetivo)
        return all
            .filter(t => t.Estado === "Pendiente")
            .sort((a, b) => {
                // Parse dates if they are strings, or use directly if Date objects
                const dateA = new Date(a.Fecha_Objetivo);
                const dateB = new Date(b.Fecha_Objetivo);
                return dateA - dateB;
            });
    }

    findTodaysTasks() {
        const all = this.findAll();
        const timeZone = Session.getScriptTimeZone();
        // Compare "YYYY-MM-DD" strings to ensure we catch everything from "today" in local time
        const todayStr = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd");

        return all
            .filter(t => {
                if (!t.Fecha_Objetivo) return false;
                // Parse the stored date (handles ISO strings or Date objects)
                const taskDate = new Date(t.Fecha_Objetivo);
                // Format task date to script's timezone
                const taskDateStr = Utilities.formatDate(taskDate, timeZone, "yyyy-MM-dd");

                return taskDateStr === todayStr;
            })
            .sort((a, b) => {
                const dateA = new Date(a.Fecha_Objetivo);
                const dateB = new Date(b.Fecha_Objetivo);
                return dateA - dateB;
            });
    }

    create(taskDto) {
        const sheet = this._getSheet();
        // Ensure ID and Defaults
        taskDto.ID = taskDto.ID || Utilities.getUuid();
        taskDto.Fecha_Creacion = new Date();
        taskDto.Estado = taskDto.Estado || "Pendiente";

        const row = TaskMapper.toRow(taskDto);
        sheet.appendRow(row);
        return taskDto;
    }

    complete(taskId) {
        const sheet = this._getSheet();
        const data = sheet.getDataRange().getValues();
        const headers = TaskMapper.getHeaders();
        const idIndex = headers.indexOf("ID");
        const statusIndex = headers.indexOf("Estado");

        if (idIndex === -1) throw new Error("ID Column not found");

        for (let i = 1; i < data.length; i++) {
            if (data[i][idIndex].toString() === taskId.toString()) {
                // Update Status column (1-based index is statusIndex + 1)
                // Row index is i + 1
                sheet.getRange(i + 1, statusIndex + 1).setValue("Completada");
                return { id: taskId, status: "Completada" };
            }
        }
        throw new Error("Task not found with ID: " + taskId);
    }

    reactivate(taskId) {
        const sheet = this._getSheet();
        const data = sheet.getDataRange().getValues();
        const headers = TaskMapper.getHeaders();
        const idIndex = headers.indexOf("ID");
        const statusIndex = headers.indexOf("Estado");

        if (idIndex === -1) throw new Error("ID Column not found");

        for (let i = 1; i < data.length; i++) {
            if (data[i][idIndex].toString() === taskId.toString()) {
                sheet.getRange(i + 1, statusIndex + 1).setValue("Pendiente");
                return { id: taskId, status: "Pendiente" };
            }
        }
        throw new Error("Task not found with ID: " + taskId);
    }

    delete(taskId) {
        const sheet = this._getSheet();
        const data = sheet.getDataRange().getValues();
        const headers = TaskMapper.getHeaders();
        const idIndex = headers.indexOf("ID");

        if (idIndex === -1) throw new Error("ID Column not found");

        for (let i = 1; i < data.length; i++) {
            if (data[i][idIndex].toString() === taskId.toString()) {
                sheet.deleteRow(i + 1);
                return { id: taskId, status: "Deleted" };
            }
        }
        throw new Error("Task not found with ID: " + taskId);
    }
}
