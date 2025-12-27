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
function getDB() {
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

    let result = {};

    switch (action) {
      case "nueva_venta":
        result = serviceCrearVenta(payload);
        break;
        
      case "addProduct": // <--- NUEVO CASO AGREGADO
        result = serviceAddProduct(payload);
        break;

      case "nuevo_stock":
        result = { message: "Función de stock aún no implementada" };
        break;

      case "health_check": 
        result = serviceHealthCheck();
        break;

      case "login":
        result = serviceLogin(payload);
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
 * 2. LÓGICA DE NEGOCIO (SERVICES)
 * ==========================================
 */

function serviceCrearVenta(payload) {
  // Tu lógica existente que funciona bien
  const repo = new VentaRepository();
  const datosLimpios = VentaMapper.toDto(payload);
  repo.save(datosLimpios);

  return {
    message: "Venta registrada correctamente",
    id_generado: datosLimpios.id_generado
  };
}

// --- NUEVO: LEER CONFIGURACIÓN (Para llenar los Selects) ---
function serviceGetOptions() {
  const ss = getDB();
  const sheet = ss.getSheetByName("Config");
  
  if (!sheet) return []; // Si no existe la hoja, devolvemos vacío

  const rows = sheet.getDataRange().getValues();
  rows.shift(); // Eliminamos la fila de cabeceras

  // Transformamos las filas de Excel en objetos JSON limpios
  const productos = rows.map(r => ({
    categoria: r[0],
    modelo: r[1],
    // Convertimos "128GB, 256GB" en arrays ["128GB", "256GB"]
    variantes: r[2] ? r[2].toString().split(',').map(s => s.trim()) : [],
    colores: r[3] ? r[3].toString().split(',').map(s => s.trim()) : []
  }));

  return productos;
}

// --- NUEVO: AGREGAR PRODUCTO (Desde el Admin) ---
function serviceAddProduct(payload) {
  const ss = getDB();
  let sheet = ss.getSheetByName("Config");

  // Si no existe la hoja Config, la creamos al vuelo
  if (!sheet) {
    sheet = ss.insertSheet("Config");
    sheet.appendRow(["Categoria", "Modelo", "Variantes", "Colores"]); // Headers
  }

  // payload trae: { categoria, modelo, variantes, colores }
  // OJO: variantes y colores llegan como texto "A, B, C" desde el input del front, así que los guardamos directo
  sheet.appendRow([
    payload.categoria,
    payload.modelo,
    payload.variantes, 
    payload.colores
  ]);

  return { message: "Producto configurado exitosamente" };
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

function serviceGetLastSales() {
  const ss = getDB();
  const sheet = ss.getSheetByName("Clientes Minoristas"); 
  
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return []; 

  const cantidad = 10;
  const startRow = Math.max(2, lastRow - cantidad + 1);
  const numRows = lastRow - startRow + 1;

  const data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

  const ventas = data.map(r => ({
    id: r[2],           
    fecha: r[0],        
    cliente: r[3], 
    producto: r[9] + " " + r[10],     
    monto: r[15],       
    divisa: r[16]       
  }));

  return ventas.reverse();
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