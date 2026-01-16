class TaskMapper {
    static getHeaders() {
        return [
            "id",
            "tipo",
            "cliente",
            "descripcion",
            "link",
            "estado",
            "is_deleted",
            "created_at",
            "auditoria"
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
