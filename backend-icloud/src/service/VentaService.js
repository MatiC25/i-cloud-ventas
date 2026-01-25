class VentaService {
  constructor() {
    // Instanciamos el repositorio (que ya sabe en qué hoja guardar)
    this.repository = new VentaRepository();
  }

  /**
   * Recibe el payload crudo del Front (DTO externo)
   */
  static registrarVenta(payloadRaw) {
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

      // 6. --- AUDITORÍA Y LIBRO DIARIO ---
      // Preparar hoja y variables
      let sheetLibro = ss.getSheetByName("Libro Diario");
      if (!sheetLibro) {
        sheetLibro = ss.insertSheet("Libro Diario");
        sheetLibro.appendRow(GastosMapper.getHeadersPrincipal());
      }
      const headersLibro = GastosMapper.getHeadersPrincipal();
      const usuarioLogueado = payloadRaw.usuario || "Sistema";

      // Primero, calculamos el valor total de dispositivos en parte de pago
      const productosParteDePago = listaProductos.filter(p => p.esParteDePago === true);
      const valorTotalParteDePago = productosParteDePago.reduce((sum, p) => {
        // Usamos el precio del producto como valor del canje
        return sum + (Number(p.precio) || 0);
      }, 0);

      // Registrar cada dispositivo en parte de pago como "Compra Stock" en el Libro Diario
      productosParteDePago.forEach(producto => {
        const descripcionProducto = [producto.tipo, producto.modelo, producto.capacidad, producto.color]
          .filter(Boolean)
          .join(' ');

        const operacionCanje = {
          fecha: new Date(),
          detalle: `Canje (Venta ID: ${masterId}): ${descripcionProducto}`,
          tipoMovimiento: "Compra Stock",
          categoriaMovimiento: "Parte de Pago",
          monto: Number(producto.precio) || 0,
          divisa: "USD", // Asumimos USD para canjes, o podría venir del producto
          destino: "Stock Valorizado",
          comentarios: `Estado: ${producto.estado || 'N/A'} - IMEI: ${producto.imei || 'N/A'}`,
          auditoria: usuarioLogueado,
          id: masterId
        };

        const rowDataCanje = GastosMapper.toExcel(operacionCanje);
        const rowArrayCanje = headersLibro.map(h => rowDataCanje[h]);
        sheetLibro.appendRow(rowArrayCanje);
      });

      // Ahora registramos los pagos en efectivo/transferencia
      const pagos = payloadRaw.pagos || [];

      // Preparar descripción del cliente y productos para el detalle
      const nombreCliente = payloadRaw.cliente
        ? `${payloadRaw.cliente.nombre || ''} ${payloadRaw.cliente.apellido || ''}`.trim() || 'Sin Nombre'
        : 'Sin Nombre';

      const descripcionProductos = listaProductos
        .filter(p => !p.esParteDePago) // Solo productos vendidos, no canjes
        .map(p => [p.tipo, p.modelo, p.capacidad].filter(Boolean).join(' '))
        .join(', ') || 'Producto';

      // Calculamos el monto efectivo a registrar (total pagos - valor canje ya está incluido en el precio)
      // El monto de los pagos debería ser: Precio Total Venta - Valor Canje
      // Los pagos representan el dinero real que entra, no incluyen el canje
      pagos.forEach(pago => {
        // Solo registramos si hay monto real
        if (Number(pago.monto) <= 0) return;

        const operacionDto = {
          fecha: new Date(),
          detalle: `Venta: ${nombreCliente} - ${descripcionProductos}`,
          tipoMovimiento: "Ingreso",
          categoriaMovimiento: "Venta",
          monto: pago.monto,
          divisa: pago.divisa,
          destino: pago.destino || "A confirmar",
          comentarios: `Tipo Pago: ${pago.tipo || ''} - Cambio: ${pago.tipoCambio || 1}${valorTotalParteDePago > 0 ? ` (Incluye canje: $${valorTotalParteDePago})` : ''}`,
          auditoria: usuarioLogueado,
          id: masterId
        };

        const rowData = GastosMapper.toExcel(operacionDto);
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



  static getHistorialVentas() {
    try {
      return this.repository.findRecent();
    } catch (e) {
      console.error("Error en VentaService:", e);
      throw e;
    }
  }

  static getHistorialDeOperaciones() {
    const ss = getDB();
    const sheet = ss.getSheetByName("Libro Diario");

    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = GastosMapper.getHeadersPrincipal();
    const rows = data.slice(1);

    const operaciones = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return operaciones.reverse();
  }

  static serviceNuevaOperacion(payload) {
    const ss = getDB();
    let sheet = ss.getSheetByName("Libro Diario");

    if (!sheet) {
      sheet = ss.insertSheet("Libro Diario");
      sheet.appendRow(GastosMapper.getHeadersPrincipal());
    }

    const operacionDto = {
      id: payload.id || Utilities.getUuid(), // Generate ID if not present
      fecha: payload.fecha || new Date(),
      detalle: payload.detalle,
      tipoMovimiento: payload.tipo, // Front manda 'tipo' (Ingreso/Egreso)
      categoriaMovimiento: payload.categoria,
      monto: payload.monto,
      divisa: payload.divisa,
      destino: payload.destino,
      comentarios: payload.comentarios,
      auditoria: payload.usuario // Usuario desde el front
    };

    const rowData = GastosMapper.toExcel(operacionDto);
    const headers = GastosMapper.getHeadersPrincipal();
    const rowArray = headers.map(h => rowData[h]);

    sheet.appendRow(rowArray);

    // Trigger Cache Update
    DashboardService.actualizarCacheDashboard();

    return { message: "Operación registrada con éxito" };
  }

  static serviceUpdateOperacion(payload) {
    const ss = getDB();
    const sheet = ss.getSheetByName("Libro Diario");
    if (!sheet) throw new Error("No existe la hoja Libro Diario");

    const data = sheet.getDataRange().getValues();
    const idToUpdate = payload.id;

    // Dynamically find ID column index
    const headers = GastosMapper.getHeadersPrincipal();
    const idIndex = headers.indexOf("ID");

    if (idIndex === -1) {
      throw new Error("Columna ID no encontrada en la configuración del backend");
    }

    // Find row by ID
    const rowIndex = data.findIndex(row => row[idIndex].toString() === idToUpdate.toString());

    if (rowIndex === -1) {
      throw new Error("Operación no encontrada para editar");
    }

    // Construct updated DTO
    const operacionDto = {
      id: idToUpdate,
      fecha: payload.fecha ? new Date(payload.fecha) : new Date(),
      detalle: payload.detalle,
      tipoMovimiento: payload.tipo,
      categoriaMovimiento: payload.categoria,
      monto: payload.monto,
      divisa: payload.divisa,
      destino: payload.destino,
      comentarios: payload.comentarios,
      auditoria: payload.auditoria || "Sistema"
    };

    const rowData = GastosMapper.toExcel(operacionDto);
    const rowArray = headers.map(h => rowData[h]);

    // Update specific row (rowIndex + 1 because sheet is 1-based)
    sheet.getRange(rowIndex + 1, 1, 1, rowArray.length).setValues([rowArray]);

    // Trigger Cache Update
    DashboardService.actualizarCacheDashboard();

    return { status: "success", message: "Operación actualizada correctamente" };
  }

  static serviceDeleteOperacion(payload) {
    const ss = getDB();
    const sheet = ss.getSheetByName("Libro Diario");
    if (!sheet) throw new Error("No existe la hoja Libro Diario");

    const data = sheet.getDataRange().getValues();
    const idToDelete = payload.id;

    // Dynamically find ID column index
    const headers = GastosMapper.getHeadersPrincipal();
    const idIndex = headers.indexOf("ID");

    if (idIndex === -1) {
      throw new Error("Columna ID no encontrada en la configuración del backend");
    }

    // Find row by ID
    const rowIndex = data.findIndex(row => row[idIndex].toString() === idToDelete.toString());

    if (rowIndex === -1) {
      throw new Error("Operación no encontrada para eliminar");
    }

    // rowIndex + 1 is the 1-based row number
    sheet.deleteRow(rowIndex + 1);

    // Trigger Cache Update
    DashboardService.actualizarCacheDashboard();

    return { status: "success", message: "Operación eliminada correctamente" };
  }

  static serviceUpdateVenta(payload) {
    const ss = getDB();
    const sheet = ss.getSheetByName("Clientes Minoristas");
    if (!sheet) throw new Error("No existe la hoja Clientes Minoristas");

    const data = sheet.getDataRange().getValues();
    const headers = VentaMapper.getHeaders();

    const getIdx = (name) => headers.indexOf(name);
    const idIndex = getIdx("N° ID");

    if (idIndex === -1) throw new Error("Columna ID no encontrada");

    const rowIndex = data.findIndex(row => row[idIndex].toString() === payload.id.toString());
    if (rowIndex === -1) throw new Error("Venta no encontrada");

    // Get current row data
    // Beware: data array includes header. rowIndex matches row number in 'data' array.
    // Sheet is 1-based. So row number in Sheet is rowIndex + 1.
    const rowArray = data[rowIndex];

    // Helper to update value in array
    const setVal = (headerName, val) => {
      const colIdx = getIdx(headerName);
      if (colIdx !== -1) {
        rowArray[colIdx] = val;
      }
    }

    // Mapping from Payload (IVentaTabla + Edits) to Excel Headers
    setVal("Nombre y Apellido", payload.cliente);

    // Producto: The user edits description as one string. We put it in "Equipo | Producto".
    // We clear Model/Size to avoid concatenation issues in future reads.
    setVal("Equipo | Producto", payload.producto);
    setVal("Modelo", "");
    setVal("Tamaño", "");

    setVal("Cantidad", payload.cantidad);
    setVal("Monto", payload.monto);
    setVal("Costo del Producto", payload.costo);

    setVal("Profit Bruto", payload.profit);
    setVal("Tipo de Cambio", payload.tipoCambio);
    setVal("Conversión $ARS - USD", payload.conversion);

    // Updating Total in Dollars to match Monto (assuming single product line logic)
    setVal("Total en Dolares", payload.monto);

    // Save back to sheet
    sheet.getRange(rowIndex + 1, 1, 1, rowArray.length).setValues([rowArray]);

    // Trigger Cache Update
    DashboardService.actualizarCacheDashboard();

    return { status: "success", message: "Venta actualizada correctamente" };
  }

  static serviceDeleteVenta(payload) {
    const ss = getDB();
    const sheet = ss.getSheetByName("Clientes Minoristas");
    if (!sheet) throw new Error("No existe la hoja Clientes Minoristas");

    const data = sheet.getDataRange().getValues();
    const headers = VentaMapper.getHeaders();
    const idIndex = headers.indexOf("N° ID");

    if (idIndex === -1) throw new Error("Columna ID no encontrada");

    const idToDelete = payload.id || payload; // fallback if payload is just the ID string? No, object expected.

    const rowIndex = data.findIndex(row => row[idIndex].toString() === idToDelete.toString());

    if (rowIndex === -1) throw new Error("Venta no encontrada para eliminar");

    sheet.deleteRow(rowIndex + 1);

    // Trigger Cache Update
    DashboardService.actualizarCacheDashboard();

    return { status: "success", message: "Venta eliminada correctamente" };
  }


  static serviceCrearVenta(payload) {
    const res = this.registrarVenta(payload);
    DashboardService.actualizarCacheDashboard();
    return res;
  }

  static serviceGetLastSales(limit = 50) {
    const ss = getDB();
    const sheet = ss.getSheetByName("Clientes Minoristas");
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Está vacía

    // --- 1. LÓGICA DE OPTIMIZACIÓN (Solo leer lo último) ---
    // Calculamos desde qué fila empezar para traer solo los últimos 'limit' registros
    // Si hay 100 filas y limit es 10, startRow = 91.
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;

    // --- 2. OBTENER DATOS ---
    // Obtenemos solo el rango necesario (mucho más rápido que getDataRange)
    const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

    // --- 3. MAPEO DINÁMICO USANDO TU MAPPER ---
    const headers = VentaMapper.getHeaders(); // ["Fecha", "Mes", "N° ID", ...]

    const ventas = data.map(row => {
      const obj = {};

      // Iteramos sobre TUS headers para asignar el valor correcto
      headers.forEach((header, index) => {
        // row[index] es el valor en la celda
        // obj[header] crea la propiedad con el nombre exacto del header
        obj[header] = row[index];
      });

      return obj;
    });

    // --- 4. RETORNAR INVERTIDO (Lo más nuevo primero) ---
    return ventas.reverse();
  }

}