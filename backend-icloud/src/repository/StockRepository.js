class StockRepository extends GenericRepository{
  constructor() {
    super(SHEET.STOCK);
  }

//   save(datosExcel) {
//     const lastCol = sheet.getLastColumn();
//     if (lastCol === 0) throw new Error("Hoja de Stock vacía.");

//     const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

//     const newRow = headers.map(header => {
//       const headerLimpio = header.toString().trim();
//       return datosExcel[headerLimpio] !== undefined ? datosExcel[headerLimpio] : "";
//     });

//     sheet.appendRow(newRow);
//   }
}