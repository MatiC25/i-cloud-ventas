class StockMapper {
 
    static toExcel(dto){
    
        return {
            "Modelo": dto.modelo,
            "Tamaño": dto.tamaño,
            "Color": dto.color,
            "Precio": dto.precio, 
            "Estado": dto.estado,
            "Cantidad": dto.cantidad
        }
    }
}
