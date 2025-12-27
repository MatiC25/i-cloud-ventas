class VentaService {
  constructor() {
    this.repository = new VentaRepository();
  }

  registrarVenta(dto) {
    var datosExcel = VentaMapper.toExcel(dto);
    this.repository.save(datosExcel);

    return {
      status: "success",
      message: "Venta registrada exitosamente"
    };
  }
}