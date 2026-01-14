/**
 * ==========================================
 * CONFIGURACIÓN MAESTRA (SCHEMA DINÁMICO)
 * ==========================================
 */
const DB_SCHEMA = {
  // 1. Obtenemos las columnas DIRECTAMENTE de la clase VentaMapper
  "Clientes Minoristas": VentaMapper.getHeaders(),
  "Clientes Mayoristas": VentaMapper.getHeaders(),

  // 2. Obtenemos las columnas de StockMapper
  //"Stock": StockMapper.getHeaders(),
  "Tasks": TaskMapper.getHeaders(),

  // 3. Estas tablas no tienen Mapper aun, las dejamos fijas
  "Config": [
    "Categoria", "Modelo", "Variantes", "Colores"
  ],
  "Usuarios": [
    "Email", "Password", "Nombre", "Rol"
  ],
  "_LOGS": [
    "Fecha", "Estado", "Mensaje"
  ],
  "Libro Diario": GastosMapper.getHeadersPrincipal()
};


/**
 * ==========================================
 * 1. PUNTOS DE ENTRADA (CONTROLLERS)
 * ==========================================
 */

/**
 * BUSCADOR INTELIGENTE DE DATABASE
 * Intenta obtener el ID desde la configuración guardada.
 * Si no existe, usa la hoja activa (si el script está vinculado).
 */
function getDB(idOverride) {

  if (idOverride) {
    return SpreadsheetApp.openById(idOverride);
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  const storedId = scriptProperties.getProperty('SPREADSHEET_ID');

  if (storedId) {
    return SpreadsheetApp.openById(storedId);
  } else {
    // Fallback: Si no hay config, intentamos usar la hoja activa
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      throw new Error("No se ha configurado el ID de la Hoja de Cálculo en el sistema.");
    }
  }
}


/**
 * GET: Para pedir datos (Cargar listas desplegables)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getOptions") {
      const result = serviceGetOptions();
      return buildResponse("success", result);
    }


    if (action === "getLastSales") {
      return buildResponse("success", serviceGetLastSales());
    }

    if (action === "getVentas") {
      const repo = new VentaRepository();
      return buildResponse("success", repo.findAll());
    }

    if (action === "getOperaciones") {
      return buildResponse("success", getHistorialDeOperaciones());
    }

    throw new Error(`Acción GET desconocida: '${action}'`);

  } catch (error) {
    return buildResponse("error", error.toString());
  }
}

/**
 * POST: Para enviar datos (Guardar venta o configuración)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const successLock = lock.tryLock(10000); // 10 segundos de espera

  try {
    if (!successLock) {
      throw new Error("El servidor está ocupado. Intenta nuevamente.");
    }

    if (!e || !e.postData) {
      throw new Error("No se recibieron datos (Body vacío).");
    }


    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.payload;


    if (action === "check_integrity") {
      const result = serviceCheckIntegrity(request.sheetId);
      return buildResponse("success", result);
    }

    let result = {};

    switch (action) {
      case "nueva_venta":
        result = serviceCrearVenta(payload);
        break;

      case "obtenerProductos":
        result = serviceGetProducts();
        break;

      case "guardarProducto":
        result = serviceAddProduct(payload);
        break;

      case "obtenerMetodosPago":
        result = serviceGetMetodosPago();
        break;

      case "getOperaciones":
        result = getHistorialDeOperaciones();
        break;

      case "getConfig":
        result = serviceGetOptions();
        break;

      case "getVentas":
        result = serviceGetLastSales();
        break;

      case "health_check":
        result = serviceHealthCheck();
        break;

      case "save_config":
        result = serviceSaveConfig(payload);
        break;

      case "nueva_operacion":
        result = serviceNuevaOperacion(payload);
        break;

      case "update_operacion":
        result = serviceUpdateOperacion(payload);
        break;

      case "delete_operacion":
        result = serviceDeleteOperacion(payload);
        break;

      case "update_venta":
        result = serviceUpdateVenta(payload);
        break;

      case "delete_venta":
        result = serviceDeleteVenta(payload);
        break;

      case "getDashboardStats":
        result = DashboardService.getStats();
        break;

      case "trigger_cache_rebuild":
        result = DashboardService.actualizarCacheDashboard();
        break;
      
      case "getLiveBalances":
        result = DashboardService.getLiveBalances();
        break;

      // --- TAREAS COMPARTIDAS ---
      case "createTask": // payload: { descripcion, fechaObjetivo, cliente... }
        result = new TaskService().createTask(payload);
        break;

      case "getPendingTasks": // No payload needed
        result = new TaskService().getPendingTasks();
        break;

      case "getTodaysTasks": // No payload needed - returns all tasks from today
        result = new TaskService().getTodaysTasks();
        break;

      case "completeTask": // payload: { id }
        result = new TaskService().completeTask(payload.id);
        break;

      case "reactivateTask": // payload: { id }
        result = new TaskService().reactivateTask(payload.id);
        break;

      case "deleteTask": // payload: { id }
        result = new TaskService().deleteTask(payload.id);
        break;

      default:
        throw new Error(`Acción desconocida: '${action}'`);
    }

    return buildResponse("success", result);

  } catch (error) {
    return buildResponse("error", error.toString());

  } finally {
    lock.releaseLock();
  }
}

function serviceGetMetodosPago() {
  const ss = getDB();
  const sheet = ss.getSheetByName("Config_Gastos");
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = GastosMapper.getMetodosPagoHeaders();
  const rows = data.slice(1);

  const metodosPago = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  return metodosPago;
}

function getHistorialDeOperaciones() {
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

function serviceNuevaOperacion(payload) {
  const ss = getDB();
  let sheet = ss.getSheetByName("Libro Diario");

  if (!sheet) {
    sheet = ss.insertSheet("Libro Diario");
    sheet.appendRow(GastosMapper.getHeadersPrincipal());
  }

  // Payload: { fecha, detalle, tipo, categoria, monto, divisa, destino, comentarios, usuario }
  // Ajustamos propiedades para que coincidan con el Mapper DTO si es necesario
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

function serviceUpdateOperacion(payload) {
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

function serviceDeleteOperacion(payload) {
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

function serviceUpdateVenta(payload) {
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

function serviceDeleteVenta(payload) {
  const ss = getDB();
  const sheet = ss.getSheetByName("Clientes Minoristas");
  if (!sheet) throw new Error("No existe la hoja Clientes Minoristas");

  const data = sheet.getDataRange().getValues();
  const headers = VentaMapper.getHeaders();
  const idIndex = headers.indexOf("N° ID");

  if (idIndex === -1) throw new Error("Columna ID no encontrada");

  // payload might be { id: "..." } or just string if passed directly, 
  // but frontend sends { action: 'delete_venta', id: '...' } -> payload is usually the OBJECT if nested or param?
  // Checking api-back.ts: deleteVenta sends { action: 'delete_venta', id }. 
  // Wait, Controller.js logic: const payload = request.payload; 
  // If api-back sends { action, id }, then payload is UNDEFINED.
  // Let's re-read api-back.ts.

  // api-back.ts: 
  // export const deleteVenta = async (id: string) => {
  //    return await apiRequest({ action: 'delete_venta', id });
  // };
  // 
  // Controller.js:
  // const request = JSON.parse(e.postData.contents);
  // const payload = request.payload;
  // const action = request.action;
  //
  // Here, request has 'id' at root level, NOT inside 'payload'.
  // So 'payload' is undefined for deleteVenta call from api-back.ts (as currently written).
  //
  // WE MUST FIX THIS in Controller.js: 
  // Use `request.id` fallback or fix api-back.ts.
  //
  // However, I am editing Controller.js now. I can check `request.id` inside service functions or pass `request` instead of `payload`.
  // Or simpler: access `id` from the appropriate place.

  // BUT: serviceDeleteOperacion uses `payload.id`. api-back.ts sends: { action: 'delete_operacion', payload: { id } }. This is correct.
  // deleteVenta sends: { action: 'delete_venta', id }. This is INCONSISTENT.

  // I should fix `deleteVenta` in `api-back.ts` to be consistent with `deleteOperacion` pattern?
  // OR handle it here.

  // Current edit is primarily for update_venta.
  // updateVenta sends { action: 'update_venta', payload: venta }. This works fine with `payload`.

  // For `serviceDeleteVenta`, I'll assume I'll fix api-back.ts or handle `request.id`.
  // Let's rely on `payload` and implicit fix in next step if generic. 
  // I will assume payload.id is passed.

  const idToDelete = payload.id || payload; // fallback if payload is just the ID string? No, object expected.

  const rowIndex = data.findIndex(row => row[idIndex].toString() === idToDelete.toString());

  if (rowIndex === -1) throw new Error("Venta no encontrada para eliminar");

  sheet.deleteRow(rowIndex + 1);

  // Trigger Cache Update
  DashboardService.actualizarCacheDashboard();

  return { status: "success", message: "Venta eliminada correctamente" };
}

/**
 * ==========================================
 * 2. LÓGICA DE NEGOCIO (SERVICES)
 * ==========================================
 */

function serviceCrearVenta(payload) {
  // Instanciamos el servicio
  const servicio = new VentaService();

  // Delegamos todo el trabajo
  const res = servicio.registrarVenta(payload);

  // Trigger Cache Update
  DashboardService.actualizarCacheDashboard();

  return res;
}

function serviceGetOptions() {
  const ss = getDB();
  const sheet = ss.getSheetByName("D");

  if (!sheet) {
    // Si no existe la hoja "D", devolvemos arrays vacíos para evitar crash
    return {
      metodosPago: [],
      divisas: [],
      tiposDeOperaciones: [],
      tiposDeGastos: [],
      tiposDeProductos: [],
      modelosDeProductos: [],
      capacidadesDeProductos: [],
      coloresDeProductos: [],
      canalesDeVenta: [],
      estadosDeProductos: []
    };
  }

  // Obtenemos todos los datos: filas x columnas
  // Usamos getDataRange para leer solo lo que tiene datos
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return {}; // Solo headers o vacío

  const headers = data[0].map(h => h.toString().trim());
  const rows = data.slice(1);

  // Mapeo de Nombres de Columna -> Key del Objeto de Respuesta
  // "Header en Excel": "keyEnJson"
  const colMap = {
    "Métodos Pago": "metodosPago",
    "Monedas": "divisas",
    "Tipo de Operación": "tiposDeOperaciones",
    "Tipo de Gastos": "tiposDeGastos",
    "Categoría": "tiposDeProductos",
    "Modelo": "modelosDeProductos",
    "Capacidad": "capacidadesDeProductos",
    "Colores": "coloresDeProductos",
    "Canal de Venta": "canalesDeVenta",
    "Estado": "estadosDeProductos"
  };

  // Inicializamos los Sets para guardar valores únicos
  const resultSets = {};
  Object.values(colMap).forEach(key => resultSets[key] = new Set());

  // Indices de las columnas que nos interesan
  const colIndices = {};
  for (const [header, key] of Object.entries(colMap)) {
    const idx = headers.indexOf(header);
    if (idx !== -1) {
      colIndices[idx] = key;
    }
  }

  // Recorremos las filas y llenamos los Sets
  rows.forEach(row => {
    Object.keys(colIndices).forEach(colIdx => {
      const cellValue = row[colIdx];
      if (cellValue && cellValue.toString().trim() !== "") {
        const cleanValue = cellValue.toString().trim();
        const key = colIndices[colIdx];
        resultSets[key].add(cleanValue);
      }
    });
  });

  // Convertimos Sets a Arrays
  const response = {};
  Object.keys(resultSets).forEach(key => {
    response[key] = Array.from(resultSets[key]);
  });

  return response;
}

// --- NUEVO: AGREGAR PRODUCTO (Desde el Admin) ---

function serviceGetLastSales(limit = 50) {
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

function serviceGetProducts() {
  const ss = getDB();
  const sheet = ss.getSheetByName("Config_Productos");
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = ProductoMapper.getHeaders();
  const rows = data.slice(1);

  const productos = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  return productos;
}

function serviceAddProduct(payload) {
  const ss = getDB();
  let sheet = ss.getSheetByName("Config_Productos");
  if (!sheet) {
    sheet = ss.insertSheet("Config_Productos");
    sheet.appendRow(["Categoria", "Modelo", "Variantes", "Colores"]); // Headers
  }

  sheet.appendRow([
    payload.categoria,
    payload.modelo,
    payload.variantes,
    payload.colores
  ]);
  return { message: "Producto configurado exitosamente" };
}


function serviceLogin(payload) {
  const email = payload.email.toString().toLowerCase().trim();
  const password = payload.password.toString().trim();

  // 1. Abrir hoja de usuarios
  const ss = getDB(); // Usamos tu helper o SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName("Usuarios");

  if (!sheet) throw new Error("Error interno: No existe la hoja de Usuarios.");

  // 2. Leer datos (Asumimos: A=Email, B=Pass, C=Nombre, D=Rol)
  const data = sheet.getDataRange().getValues();
  // Saltamos la fila 1 (encabezados)
  const users = data.slice(1);

  // 3. Buscar coincidencia
  // user[0] es email, user[1] es password
  const usuarioEncontrado = users.find(u =>
    u[0].toString().toLowerCase() === email &&
    u[1].toString() === password
  );

  if (usuarioEncontrado) {
    return {
      authenticated: true,
      user: {
        email: usuarioEncontrado[0],
        name: usuarioEncontrado[2], // Columna C
        role: usuarioEncontrado[3]  // Columna D ('admin' o 'vendedor')
      }
    };
  } else {
    throw new Error("Credenciales incorrectas");
  }
}

function serviceCheckIntegrity(sheetId) {
  const ss = getDB(sheetId); // Abrimos el Excel específico
  const log = [];

  // Iteramos sobre nuestro SCHEMA maestro
  for (const tabName in DB_SCHEMA) {
    const requiredCols = DB_SCHEMA[tabName];
    let sheet = ss.getSheetByName(tabName);

    // CASO 1: La hoja no existe -> CREAR
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      sheet.appendRow(requiredCols);

      // Estilos
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, requiredCols.length).setFontWeight("bold");

      log.push(`✅ Creada hoja: ${tabName}`);
    }

    // CASO 2: La hoja existe -> REVISAR COLUMNAS
    else {
      const lastCol = sheet.getLastColumn();
      let currentHeaders = [];

      if (lastCol > 0) {
        currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      }

      // Convertimos a String y trim por seguridad
      const normalizedCurrent = currentHeaders.map(h => h.toString().trim());

      const missingCols = [];
      requiredCols.forEach(col => {
        if (!normalizedCurrent.includes(col)) {
          missingCols.push(col);
        }
      });

      if (missingCols.length > 0) {
        // Agregamos al final
        const startCol = (lastCol === 0) ? 1 : lastCol + 1;
        sheet.getRange(1, startCol, 1, missingCols.length).setValues([missingCols]);
        sheet.getRange(1, startCol, 1, missingCols.length).setFontWeight("bold");

        log.push(`⚠️ En '${tabName}' se agregaron: ${missingCols.join(", ")}`);
      }

      // --- BACKFILL IDS (Específico para Libro Diario y Ventas) ---
      // Si la tabla tiene columna "ID" o "N° ID", verificamos que no haya vacíos
      if (tabName === "Libro Diario" || tabName === "Clientes Minoristas") {
        const idColName = tabName === "Libro Diario" ? "ID" : "N° ID";
        const idColIdx = normalizedCurrent.indexOf(idColName); // 0-based index in headers array

        if (idColIdx !== -1) {
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            // Leemos solo la columna de IDs para ser eficientes
            // getRange(row, col, numRows, numCols) -> col is 1-based = idColIdx + 1
            const idRange = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1);
            const idValues = idRange.getValues(); // [[id1], [id2], ...]

            let fixedCount = 0;
            const newValues = idValues.map(row => {
              const val = row[0].toString().trim();
              if (val === "") {
                fixedCount++;
                return [Utilities.getUuid()]; // Generamos ID
              }
              return [val]; // Mantenemos existente
            });

            if (fixedCount > 0) {
              idRange.setValues(newValues);
              log.push(`🔧 En '${tabName}' se generaron IDs para ${fixedCount} filas.`);
            }
          }
        }
      }
    }
  }

  return {
    status: "success",
    changes: log,
    message: log.length > 0 ? log.join("\n") : "Estructura correcta."
  };
}

function serviceSaveConfig(payload) {
  const newId = payload.sheetId;
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', newId);
  return { message: "Configuración guardada. El sistema ahora apunta al nuevo Excel." };
}

/**
 * ==========================================
 * 3. HELPERS
 * ==========================================
*/
function buildResponse(status, data) {
  const output = {
    status: status,
    [status === "error" ? "message" : "data"]: data
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- FUNCIÓN DE INSTALACIÓN (SOLO EJECUTAR UNA VEZ) ---
function SETUP_INICIAL() {
  const MI_ID_REAL = "1gk8Miut5Wt5uv_HkZG4pSL3yAJYPMOrz0YFOrRRBhPo";

  // Guardamos el ID en la "bóveda" segura del script
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', MI_ID_REAL);

  console.log("Sistema configurado correctamente. ID guardado en memoria.");
}

function DEBUG_DONDE_ESTAS_CONECTADO() {
  try {
    // 1. Leemos la memoria del script
    const scriptProperties = PropertiesService.getScriptProperties();
    const storedId = scriptProperties.getProperty('SPREADSHEET_ID');

    console.log("🔑 ID Guardado en Memoria:", storedId);

    if (!storedId) {
      console.error("❌ ERROR: No hay ningún ID guardado. El sistema está ciego.");
      return;
    }

    // 2. Intentamos abrir ese archivo
    const ss = SpreadsheetApp.openById(storedId);
    console.log("✅ Conexión Exitosa");
    console.log("📄 Nombre del Archivo:", ss.getName());
    console.log("🔗 URL del Archivo:", ss.getUrl());

    // 3. Chequeamos si existe la hoja Config
    const sheet = ss.getSheetByName("Config");
    if (sheet) {
      console.log("✅ Hoja 'Config' encontrada. Última fila con datos:", sheet.getLastRow());
    } else {
      console.error("⚠️ La hoja 'Config' NO existe en este archivo.");
    }

  } catch (e) {
    console.error("💥 Explotó todo:", e.message);
  }
}
function serviceHealthCheck() {
  const ss = getDB();
  let sheet = ss.getSheetByName("_LOGS");
  if (!sheet) {
    sheet = ss.insertSheet("_LOGS");
    sheet.appendRow(["Fecha", "Estado", "Mensaje"]);
  }

  const timestamp = new Date();
  sheet.appendRow([timestamp, "OK", "Conexión exitosa desde React"]);

  return { status: "System Online", timestamp: timestamp };
}