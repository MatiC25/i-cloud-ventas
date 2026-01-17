// FACEBOOK_REPOSITORY //

class FacebookRepository extends _GenericRepository {

    constructor() {
        super("FACEBOOK_STATS");
    }
}

// HEAVY_FACEBOOK_REPOSITORY //

class HeavyFacebookRepository extends _GenericRepository{

    constructor() {
        super("HEAVY_FACEBOOK_STATS");
    }

}

// STOCK_REPOSITORY //

class StockRepository extends _GenericRepository{
  constructor() {
    super(SHEET.STOCK);
  }

}

// TASK_REPOSITORY //

class TaskRepository extends _GenericRepository {
    constructor() {
        super("Tareas");
    }

    _getSheet() {
        const ss = getDB();
        let sheet = ss.getSheetByName(this.sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(this.sheetName);
            sheet.appendRow(TaskMapper.getHeaders());
        }
        return sheet;
    }
}

// VENTA_REPOSITORY //

class VentaRepository extends _GenericRepository {
  constructor(sheetName = SHEET.CLIENTES_MINORISTAS) {
    // YA NO necesitamos hardcodear el ID ni el MAP.
    // Usamos las constantes globales.
    super(sheetName);
  }

  /**
   * Obtiene las últimas ventas registradas.
   * @param {number} limit - Cantidad máxima de filas a traer (ej: 50)
   */
  findRecent(limit = 100) { // Por defecto trae 100 si no le pasas nada
    const ss = getDB();
    const sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Solo hay headers o está vacía

    // --- LÓGICA DE PAGINACIÓN INVERSA (Lo más nuevo está al final) ---

    // 1. Calculamos cuántas filas de datos reales hay (restando el header)
    const totalDataRows = lastRow - 1;

    // 2. Ajustamos el límite: si piden 100 pero hay 50, traemos 50.
    const effectiveLimit = Math.min(limit, totalDataRows);

    // 3. Calculamos la fila de inicio. 
    // Ejemplo: Si hay 1000 filas y quiero las últimas 100:
    // Start = 1000 - 100 + 1 = 901.
    const startRow = lastRow - effectiveLimit + 1;

    // --- LECTURA OPTIMIZADA ---

    // Leemos los Headers (Siempre fila 1)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Leemos SOLO el rango final (StartRow hasta el final)
    // getRange(fila, col, numFilas, numCols)
    const data = sheet.getRange(startRow, 1, effectiveLimit, sheet.getLastColumn()).getValues();

    // Mapeamos y REVERTIMOS (.reverse) para que salga primero la venta más nueva
    return data.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        // Normalizamos keys (ej: "Total USD" -> "totalUsd" si quisieras, o lo dejas igual)
        obj[h.toString().trim()] = row[i];
      });
      return obj;
    }).reverse();
  }

}




