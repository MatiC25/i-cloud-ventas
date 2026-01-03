class StockService {
  constructor() {
    this.repository = new StockRepository();
  }

  agregarProducto(dto) {
    // 1. Mapeo a formato Excel (StockMapper ya lo tenías)
    const datosExcel = StockMapper.toExcel(dto);
    
    // 2. Guardar
    this.repository.save(datosExcel);
    
    return { status: "success", message: "Producto agregado al stock" };
  }
}