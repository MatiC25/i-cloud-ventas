class VentaService {
  constructor() {
    // Instanciamos el repositorio (que ya sabe en qué hoja guardar)
    this.repository = new VentaRepository();
  }

  /**
   * Recibe el payload crudo del Front (DTO externo)
   */
  registrarVenta(payloadRaw) {
    try {
      // 1. Convertir Payload -> DTO Interno (Cálculos, ID, Fechas)
      const dtoInterno = VentaMapper.toDto(payloadRaw);

      // 2. Convertir DTO Interno -> Formato Excel (Nombres de columnas)
      const datosExcel = VentaMapper.toExcel(dtoInterno);

      // 3. Guardar (El repo se encarga de matchear columnas)
      this.repository.save(datosExcel);

      return {
        status: "success",
        message: "Venta registrada exitosamente",
        id_generado: dtoInterno.id
      };

    } catch (e) {
      console.error("Error en VentaService:", e);
      throw e; // Re-lanzamos para que el Controller lo capture
    }
  }
}