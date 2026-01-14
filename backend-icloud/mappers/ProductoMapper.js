class ProductoMapper {
    
    static getHeaders() {
        return [
            "Categoria", 
            "Modelo", 
            "Variantes", 
            "Colores"
        ];
    }

    static toExcel(producto) {
        return {
            "Categoria": producto.categoria,
            "Modelo": producto.modelo,
            "Variantes": producto.variantes,
            "Colores": producto.colores
        };
    }

    static toDto(producto) {
        return {
            "Categoria": producto.categoria,
            "Modelo": producto.modelo,
            "Variantes": producto.variantes,
            "Colores": producto.colores
        };
    }

}
