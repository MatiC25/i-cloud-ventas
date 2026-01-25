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

    let result = {};

    switch (action) {
      case "getOptions":
        result = serviceGetOptions();
        break;

      case "getLastSales":
        result = serviceGetLastSales();
        break;
      case "getVentas":
        result = serviceGetLastSales();
        break;
      case "getOperaciones":
        result = serviceGetLastSales();
        break;
      case "getTasks":
        result = serviceGetLastSales();
        break;

      // ================= //
      // Agregador Service //
      // ================= //

      case "getRecentOperations":
        const limit = e.parameter.limit ? parseInt(e.parameter.limit) : 50;
        result = AgregadorService.getRecentOperations(limit);
        break;

      case "getRecentOperationsSorted":
        result = AgregadorService.getRecentOperationsSorted();
        break;
    }

    return buildResponse("success", result);

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

    const ADMIN_ACTIONS = ["save_facebook_config", "check_integrity", "check_facebook_data", "test_name_fb"];

    if (ADMIN_ACTIONS.includes(action)) {

      const validacion = ValidadorService.validarAdminClerk(request.sessionId);

      if (!validacion.esAdmin) {
        throw new Error(`Acceso Denegado: ${validacion.error || 'No tienes permisos de administrador.'}`);
      }

      Logger.log(`Acción Admin '${action}' autorizada para usuario: ${validacion.userId}`);
    }


    if (action === "check_integrity") {
      const result = serviceCheckIntegrity(request.sheetId);
      return buildResponse("success", result);
    }

    if (action === "save_facebook_config") {
      const result = ConfigService.saveFacebookSettings(payload);
      return buildResponse("success", result);
    }

    if (action === "check_facebook_data") {
      const result = FacebookAdsService.dailyHistory();
      return buildResponse("success", result);
    }

    if (action === "test_name_fb") {
      const result = FacebookAdsService.testNameFB();
      return buildResponse("success", result);
    }

    let result = {};

    switch (action) {


      // ============= //
      // Config Service //
      // ============= //
      case "getConfig":
        result = ConfigService.serviceGetOptions();
        break;

      case "getFullConfig":
        result = ConfigService.getFullConfig();
        break;

      case "save_config":
        result = ConfigService.serviceSaveConfig(payload);
        break;

      case "nueva_operacion":
        result = VentaService.serviceNuevaOperacion(payload);
        break;

      case "health_check":
        result = ConfigService.serviceHealthCheck();
        break;

      case "save_config_sheets":
        result = ConfigService.serviceSaveConfigSheets(payload);
        break;

      // ============= //
      // Stock Service //
      // ============= //
      case "obtenerProductos":
        result = StockService.serviceGetProducts();
        break;

      case "guardarProducto":
        result = StockService.serviceAddProduct(payload);
        break;

      case "obtenerMetodosPago":
        result = StockService.serviceGetMetodosPago();
        break;

      // ============= //
      // Venta Service //
      // ============= //
      case "getOperaciones":
        result = VentaService.getHistorialDeOperaciones();
        break;

      case "nueva_venta":
        result = VentaService.serviceCrearVenta(payload);
        break;

      case "getVentas":
        result = VentaService.serviceGetLastSales();
        break;

      case "update_operacion":
        result = VentaService.serviceUpdateOperacion(payload);
        break;

      case "delete_operacion":
        result = VentaService.serviceDeleteOperacion(payload);
        break;

      case "update_venta":
        result = VentaService.serviceUpdateVenta(payload);
        break;

      case "delete_venta":
        result = VentaService.serviceDeleteVenta(payload);
        break;

      // ============= //
      // Dashboard Service //
      // ============= //

      case "getDashboardStats":
        result = DashboardService.getDashboardStats();
        break;

      case "getLiveBalances":
        result = DashboardService.getLiveBalances();
        break;

      case "getVentasCharts":
        result = DashboardService.getVentasCharts();
        break;

      // ============= //
      // Task Service //
      // ============= //
      case "createTask":
        result = TaskService.createTask(payload);
        break;

      case "updateTask":
        result = TaskService.updateTask(payload);
        break;

      case "deleteTask":
        result = TaskService.deleteTask(payload.id);
        break;

      case "getTasks":
        result = TaskService.getTasks();
        break;

      // ============================== //
      // Dashboard Service CACHE PRUEBA //
      // ============================== //

      case "checkCacheStatus":
        Logger.log("🧪 Entró a checkCacheStatus");
        const cache = CacheService.getScriptCache();
        const CACHE_KEY = 'ICONNECT_DASHBOARD_KPI_V2';

        const rawValue = cache.get(CACHE_KEY);

        let status = "MISS (Vacío)";
        let details = {};

        if (rawValue) {
          if (rawValue.startsWith("##CHUNKS##|")) {
            status = "HIT (Fragmentado)";
            const parts = parseInt(rawValue.split("|")[1]);
            details = { type: "chunked", parts };
          } else {
            status = "HIT (Directo)";
            details = { type: "simple", length: rawValue.length };
          }
        }

        result = {
          cacheStatus: status,
          details,
          timestamp: new Date().toISOString()
        };
        break;

      case "getDashboardStatsCached":
        result = DashboardService.getDashboardStatsCached();
        break;

      case "getDashboardStatsNoCache":
        result = DashboardService.getDashboardStatsNoCache();
        break;

      case "triggerCacheRebuild":
        result = DashboardService.triggerCacheRebuild(payload.category);
        break;

      // ============================== //
      // Agregador Service //
      // ============================== //

      case "getRecentOperations":
        result = AgregadorService.getRecentOperations();
        break;

      case "getRecentOperationsSorted":
        result = AgregadorService.getRecentOperationsSorted();
        break;

      case "invalidateAgregadorCache":
        result = AgregadorService.invalidateCache();
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


/**
 * ==========================================
 * HELPERS
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

function MANUAL_TEST_FACEBOOK() {
  console.log("🚀 Iniciando secuencia de autorización manual...");
  const resultado = FacebookAdsService.dailyHistory();
  console.log("✅ Ejecución terminada. Resultado:", JSON.stringify(resultado));
}

function FORCE_AUTH() {
  // Esto no hace nada útil, solo obliga a Google a pedirte permiso
  UrlFetchApp.fetch("https://www.google.com");
}