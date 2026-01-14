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
      // 1. Obtener ID de Transacción Único para toda la operación
      /* DEBUG TEMPORAL - SI VES ESTE ERROR ES QUE EL CODIGO SI SE ACTUALIZO */
      // throw new Error(`DEBUG: TipoVenta recibida: "${payloadRaw.tipoVenta}" - Hoja destino: "${payloadRaw.tipoVenta === 'Mayorista' ? SHEET.CLIENTES_MAYORISTAS : SHEET.CLIENTES_MINORISTAS}"`);

      const targetSheet = payloadRaw.tipoVenta === 'Mayorista' ? SHEET.CLIENTES_MAYORISTAS : SHEET.CLIENTES_MINORISTAS;

      // AUTO-CREACIÓN DE HOJA SI NO EXISTE
      const ss = getDB();
      let sheetCheck = ss.getSheetByName(targetSheet);
      if (!sheetCheck) {
        sheetCheck = ss.insertSheet(targetSheet);
        sheetCheck.appendRow(VentaMapper.getHeaders());
        // Formato básico bold
        sheetCheck.getRange(1, 1, 1, VentaMapper.getHeaders().length).setFontWeight("bold");
      }

      const masterId = IdGenerator.getNextId(targetSheet, "N° ID");

      // Instanciamos el repo con la hoja correcta para guardar
      const repo = new VentaRepository(targetSheet);

      // 2. Iterar sobre todos los productos (Ventas y Canjes)
      // El payloadRaw.productos contiene el array unificado
      const listaProductos = payloadRaw.productos || [];

      // Si por alguna razón no hay productos, intentamos usar el formato legacy o fallamos
      if (listaProductos.length === 0) {
        throw new Error("No hay productos en la venta");
      }

      listaProductos.forEach(prod => {
        // Determinamos si es Venta o Canje
        const isTradeIn = prod.esParteDePago === true;

        // 3. Construir un payload individual simulando la estructura esperada por el Mapper
        // Mantenemos Cliente y Transaccion comunes.
        // Separamos Producto vs ParteDePago según el tipo.
        const singlePayload = {
          cliente: payloadRaw.cliente,
          transaccion: payloadRaw.transaccion,
          // Si es canje, producto va vacío. Si es venta, va en producto.
          producto: isTradeIn ? {} : prod,
          parteDePago: isTradeIn ? { ...prod, esParteDePago: true } : { esParteDePago: false },
          pagos: payloadRaw.pagos || [], // Pasamos los pagos para calcular totales
          usuario: payloadRaw.usuario // Pasamos el usuario para auditoría
        };

        // 4. Convertir a DTO usando el Master ID
        const dtoInterno = VentaMapper.toDto(singlePayload, masterId);

        // 5. Mapear a excel y guardar fila
        const datosExcel = VentaMapper.toExcel(dtoInterno);
        repo.save(datosExcel);
      });

      // 6. --- NUEVO: AUDITORÍA Y LIBRO DIARIO ---
      // Registramos automáticamente cada pago como un ingreso en el Libro Diario
      const pagos = payloadRaw.pagos || [];

      let sheetLibro = ss.getSheetByName("Libro Diario");

      if (!sheetLibro) {
        sheetLibro = ss.insertSheet("Libro Diario");
        sheetLibro.appendRow(GastosMapper.getHeadersPrincipal());
      }

      const usuarioLogueado = payloadRaw.usuario || "Sistema";

      pagos.forEach(pago => {
        // Objeto DTO para GastosMapper
        const operacionDto = {
          fecha: new Date(), // Fecha real de carga
          detalle: `Venta ID: ${masterId}`,
          tipoMovimiento: "Ingreso",
          categoriaMovimiento: "Venta",
          monto: pago.monto,
          divisa: pago.divisa,
          destino: "Caja", // Por defecto a Caja, o podría venir del pago
          comentarios: `Tipo Pago: ${pago.tipo || ''} - Cambio: ${pago.tipoCambio || 1}`,
          auditoria: usuarioLogueado
        };

        const rowData = GastosMapper.toExcel(operacionDto);

        // Mapeamos a array según headers (orden estricto)
        // GastosMapper.toExcel devuelve Objeto { "Header": Valor }.
        // Necesitamos ordenarlo según GastosMapper.getHeadersPrincipal()
        const headersLibro = GastosMapper.getHeadersPrincipal();
        const rowArray = headersLibro.map(h => rowData[h]);

        sheetLibro.appendRow(rowArray);
      });

      return {
        status: "success",
        message: "Venta registrada exitosamente",
        id_operacion: masterId // Retornamos el ID compartido
      };

    } catch (e) {
      console.error("Error en VentaService:", e);
      throw e;
    }
  }


  getHistorialVentas() {
    try {
      return this.repository.findRecent();
    } catch (e) {
      console.error("Error en VentaService:", e);
      throw e;
    }
  }
}