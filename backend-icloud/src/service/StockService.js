class StockService {
  constructor() {
    this.repository = new StockRepository();
  }

  static agregarProducto(dto) {
    // 1. Mapeo a formato Excel (StockMapper ya lo tenías)
    const datosExcel = StockMapper.toExcel(dto);

    // 2. Guardar
    this.repository.save(datosExcel);

    return { status: "success", message: "Producto agregado al stock" };
  }


  static serviceGetMetodosPago() {
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

  static serviceGetProducts() {
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

static serviceAddProduct(payload) {
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

}