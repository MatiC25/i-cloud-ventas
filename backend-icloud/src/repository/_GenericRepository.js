class _GenericRepository {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  /**
   * ESTA ES LA EVOLUCIÓN DE TU FUNCIÓN 'registrarNombresColumnas'
   * @param {Object} dataObject - { "HeaderExcel": "Valor" }
   */
  save(dataObject) {
    // 1. Usamos getDB() para obtener el Excel configurado dinámicamente
    const ss = getDB();
    const sheet = ss.getSheetByName(this.sheetName);

    if (!sheet) {
      throw new Error(`Error Crítico: La hoja '${this.sheetName}' no existe. Ejecuta 'Verificar Conexión' en el panel de control.`);
    }

    // 2. Leemos encabezados actuales
    let lastCol = sheet.getLastColumn();
    let headers = [];

    if (lastCol > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => h.toString().trim()); // Normalizamos
    }

    // 3. DETECCIÓN Y CREACIÓN DE NUEVAS COLUMNAS (Schema Evolution)
    const newHeaders = [];
    Object.keys(dataObject).forEach(key => {
      // Si la llave del objeto no existe en los headers actuales, es una columna nueva
      if (!headers.includes(key)) {
        newHeaders.push(key);
        headers.push(key); // La agregamos a la lista local para que el mapeo posterior funcione
      }
    });

    // Si encontramos columnas nuevas, las escribimos en el Excel
    if (newHeaders.length > 0) {
      const startCol = lastCol + 1;
      // Escribimos todas las nuevas cabeceras de una sola vez
      sheet.getRange(1, startCol, 1, newHeaders.length).setValues([newHeaders]);
      lastCol += newHeaders.length; // Actualizamos referencia
    }

    // 4. Mapeo Dinámico
    const newRow = new Array(headers.length).fill("");
    let matchCount = 0;

    headers.forEach((header, index) => {
      // Como ya normalizamos 'headers' y las keys de dataObject son controladas, el match es directo
      if (dataObject.hasOwnProperty(header)) {
        newRow[index] = dataObject[header];
        matchCount++;
      }
    });

    if (matchCount === 0) {
      console.warn(`Advertencia: Se guardó una fila en '${this.sheetName}' pero ninguna columna coincidió.`);
    }

    // 5. Guardar
    sheet.appendRow(newRow);

    return { success: true, row: sheet.getLastRow() };
  }

  /**
   * Obtiene TODOS los registros de la hoja.
   * Útil para cálculos globales (Dashboard, Balances).
   * @returns {Array<Object>} Array de objetos con claves = headers
   */
  findAll() {
    const ss = getDB();
    const sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Solo headers o vacía

    // Leer Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Leer Datos
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    // Mapear
    return data.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.toString().trim()] = row[i];
      });
      return obj;
    }).reverse();
  }



    findAllNotReversed() {
    const ss = getDB();
    const sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Solo headers o vacía

    // Leer Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Leer Datos
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    // Mapear
    return data.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.toString().trim()] = row[i];
      });
      return obj;
    });
  }


  findAllWith(limit = 100) {
    const ss = getDB();
    const sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // Solo headers o vacía

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

    // Leemos Headers (Siempre fila 1)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Leemos SOLO el rango final (StartRow hasta el final)
    // getRange(fila, col, numFilas, numCols)
    const data = sheet.getRange(startRow, 1, effectiveLimit, sheet.getLastColumn()).getValues();

    // Mapeamos y REVERTIMOS (.reverse) para que salga primero la venta más nueva
    return data.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.toString().trim()] = row[i];
      });
      return obj;
    }).reverse();
  }



}