class GastosMapper {

    static getHeadersPrincipal() {
        return [
            "Fecha",
            "Detalle",
            "Tipo de Movimiento",
            "Categoría de Movimiento",
            "Monto",
            "Divisa",
            "Destino",
            "Comentarios",
            "Auditoría",
            "ID"
        ];
    }

    static getMetodosPagoHeaders() {
        return [
            "Destinos",
            "Divisas",
            "Tipos de Movimiento",
            "Categoría de Movimiento",
        ];
    }

    static toExcel(dto) {
        return {
            "Fecha": dto.fecha,
            "Detalle": dto.detalle,
            "Tipo de Movimiento": dto.tipoMovimiento,
            "Categoría de Movimiento": dto.categoriaMovimiento,
            "Monto": dto.monto,
            "Divisa": dto.divisa,
            "Destino": dto.destino,
            "Comentarios": dto.comentarios,
            "Auditoría": dto.auditoria,
            "ID": dto.id
        };
    }

}