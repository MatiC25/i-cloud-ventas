class TaskMapper {
    static getHeaders() {
        return [
            "ID",
            "Fecha_Creacion",
            "Fecha_Objetivo",
            "Descripcion",
            "Cliente",
            "Estado", // Pendiente, Completada, Vencida
            "Prioridad", // Alta, Media, Baja (Opcional, pero util)
            "Creado_Por"
        ];
    }

    static toDTO(rowArray) {
        const headers = this.getHeaders();
        const dto = {};
        headers.forEach((header, index) => {
            dto[header] = rowArray[index];
        });
        return dto;
    }

    static toRow(dto) {
        const headers = this.getHeaders();
        return headers.map(header => dto[header] || "");
    }
}
