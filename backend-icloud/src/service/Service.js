function guardarVenta(ventaDTO){
    const ventaExcel = VentaMapper.toExcel(ventaDTO);
    registrarNombresColumnas(SHEET.CLIENTES_MINORISTAS, ventaExcel);
}

function guardarStock(stockDTO){  
    const stockExcel = StockMapper.toExcel(stockDTO);
    registrarNombresColumnas(SHEET.STOCK, stockExcel);
}