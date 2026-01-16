class TaskRepository extends GenericRepository {
    constructor() {
        super("Tareas");
    }

    _getSheet() {
        const ss = getDB();
        let sheet = ss.getSheetByName(this.sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(this.sheetName);
            sheet.appendRow(TaskMapper.getHeaders());
        }
        return sheet;
    }


}
