function registrarNombresColumnas(nombreSheet, dataObject){
    const ss = SpreadsheetApp.openById("1gk8Miut5Wt5uv_HkZG4pSL3yAJYPMOrz0YFOrRRBhPo");
    const sheet = ss.getSheetByName(nombreSheet);

    if (!sheet){
        throw new Error("Sheet not found");
    }

    const headers = sheet.getDataRange().getValues()[0];
    
    const newRow = new Array(headers.length).fill(""); 
  let matchCount = 0;

  headers.forEach((header, index) => {
    const cleanHeader = header.toString().trim(); 

    if (dataObject.hasOwnProperty(cleanHeader)) {
      newRow[index] = dataObject[cleanHeader];
      matchCount++;
    }
  });

  if (matchCount === 0) {
    console.warn("Advertencia: Se intentó guardar datos pero ninguna columna coincidió.");
  }

  sheet.appendRow(newRow);
  
  return { 
    success: true, 
    row: sheet.getLastRow(), 
    matchedFields: matchCount 
  };

}