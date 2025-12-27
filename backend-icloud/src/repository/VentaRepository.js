class VentaRepository {
  constructor() {
    this.spreadsheetId = "1gk8Miut5Wt5uv_HkZG4pSL3yAJYPMOrz0YFOrRRBhPo"; 
    this.sheetName = "Clientes Minoristas";
    
    this.COLUMN_MAP = {
      "fecha": "Fecha",
      "mes": "Mes",
      "id": "N° ID",
      "nombreCompleto": "Nombre y Apellido",
      "canal": "Canal",
      "contacto": "Contacto",
      "email": "Mail",
      "cantidad": "Cantidad",
      "tipoProducto": "Equipo | Producto",
      "modelo": "Modelo",
      "capacidad": "Tamaño",
      "color": "Color",
      "estado": "Estado",
      "imei": "IMEI | Serial",
      "envioRetiro": "Envio | Retiro",
      "monto": "Monto",
      "divisa": "Divisa",
      "ppTipo": "Equipo en parte de pago",
      "ppModelo": "Modelo del equipo",
      "ppCapacidad": "Capacidad",
      "ppImei": "IMEI",
      "ppCosto": "Costo del Equipo en Parte de pago",
      "tipoCambio": "Tipo de Cambio",
      "conversion": "Conversión $ARS - USD",
      "costoProducto": "Costo del Producto",
      "profit": "Profit Bruto",
      "comentarios": "Comentarios"
    };
  }

  save(dataObject) {
    const ss = SpreadsheetApp.openById(this.spreadsheetId);
    const sheet = ss.getSheetByName(this.sheetName);


    console.log("Entramos al save");
    console.log("Spreadsheet: " + ss.getName());
    console.log("Sheet: " + sheet.getName());


    if (!sheet) throw new Error(`No se encontró la hoja '${this.sheetName}'`);

    // 1. Leemos los encabezados REALES que tiene el Excel AHORA
    // (Esto hace que no importe el orden de las columnas)
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) throw new Error("La hoja está vacía (sin cabeceras).");
    
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 2. Preparamos la fila nueva
    const newRow = new Array(headers.length).fill(""); // Fila vacía
    
    // 3. Rellenamos dinámicamente
    headers.forEach((headerExcel, index) => {
      const headerLimpio = headerExcel.toString().trim();
      
      // Buscamos qué clave de nuestro código corresponde a esta columna de Excel
      // (Buscamos la Key cuya Value coincida con el headerExcel)
      const keyCodigo = Object.keys(this.COLUMN_MAP).find(key => this.COLUMN_MAP[key] === headerLimpio);
      
      // Si encontramos mapeo Y tenemos dato para esa clave...
      if (keyCodigo && dataObject[keyCodigo] !== undefined) {
        newRow[index] = dataObject[keyCodigo];
      }
    });

    // 4. Guardamos
    sheet.appendRow(newRow);
  }
}