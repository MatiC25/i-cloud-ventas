class GenericRepository {
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
      // Si la hoja no existe, intentamos repararla al vuelo o lanzamos error
      throw new Error(`Error Crítico: La hoja '${this.sheetName}' no existe. Ejecuta 'Verificar Conexión' en el panel de control.`);
    }

    // 2. Leemos encabezados (Tu lógica original, perfecta)
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) throw new Error(`La hoja '${this.sheetName}' está vacía.`);

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const newRow = new Array(headers.length).fill(""); 
    let matchCount = 0;

    // 3. Mapeo Dinámico (Tu algoritmo original)
    headers.forEach((header, index) => {
      const cleanHeader = header.toString().trim(); // Limpiamos espacios

      if (dataObject.hasOwnProperty(cleanHeader)) {
        newRow[index] = dataObject[cleanHeader];
        matchCount++;
      }
    });

    if (matchCount === 0) {
      console.warn(`Advertencia: Se guardó una fila en '${this.sheetName}' pero ninguna columna coincidió.`);
    }

    // 4. Guardar
    sheet.appendRow(newRow);
    
    return { success: true, row: sheet.getLastRow() };
  }
}