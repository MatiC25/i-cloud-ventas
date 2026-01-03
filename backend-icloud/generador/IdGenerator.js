class IdGenerator {

  /**
   * Obtiene el siguiente ID de forma atómica y segura.
   * @param {string} sheetName - Nombre de la hoja
   * @param {string} idColumnName - Nombre de la columna del ID (ej: "N° ID")
   * @returns {number} El siguiente ID
   */
  static getNextId(sheetName, idColumnName) {
    const ss = getDB();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) throw new Error(`Hoja ${sheetName} no encontrada`);

    const headers = sheet.getDataRange().getValues()[0];
    const columnIndex = headers.findIndex(h => h.toString().trim() === idColumnName);

    if (columnIndex === -1) {
      throw new Error(`Columna de ID '${idColumnName}' no encontrada en ${sheetName}`);
    }

    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) return 1; 

    const columnValues = sheet.getRange(2, columnIndex + 1, lastRow - 1, 1).getValues();
    let maxId = 0;
    
    columnValues.flat().forEach(val => {
      const num = Number(val);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    });

    return maxId + 1;
  }
}