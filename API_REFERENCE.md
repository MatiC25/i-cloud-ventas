# API Reference (Google Apps Script)

**Dispatcher:** `e.parameter.action` (Query Parameter en GET) o `request.action` (JSON Body en POST).
**URL Base:** *La URL de tu Web App desplegada (exec).*

---

## 🟢 Métodos GET
Utilizados para lectura de datos rápida y configuraciones.

### `getConfig` (anteriormente `getOptions`)
- **Descripción:** Obtiene la lista de productos configurados (categorías, modelos, variantes) para poblar los selectores del frontend.
- **Payload:** N/A (Action: `getConfig`)
- **Respuesta Exitosa:**
    ```json
    {
      "status": "success",
      "data": [
        { "categoria": "iPhone", "modelo": "13", "variantes": ["128GB"], "colores": ["Blue"] },
        ...
      ]
    }
    ```

### `getVentas` (anteriormente `getLastSales`)
- **Descripción:** Recupera el historial de ventas paginado o limitado.
- **Parámetros:** `limit` (opcional, default 50).
- **Respuesta Exitosa:**
    ```json
    {
      "status": "success",
      "data": [
        { "id": "OP-123", "fecha": "...", "cliente": "Juan", "producto": "iPhone 13", "monto": 800, "estado": "Completado" },
        ...
      ]
    }
    ```

---

## 🟠 Métodos POST
Utilizados para escrituras y acciones transaccionales. Esperan un body JSON con la estructura `{ action: "...", payload: { ... } }`.

### `nueva_venta`
- **Descripción:** Registra una nueva venta, con soporte para múltiples pagos y auditoría de usuario.
- **Payload (`request.payload`):**
    ```json
    {
      "usuario": "email@user.com", // Usuario logueado (Clerk)
      "cliente": { 
          "nombre": "...", 
          "email": "...", 
          "canal": "Instagram" 
      },
      "productos": [
          { "tipo": "...", "modelo": "...", "imei": "..." }
      ],
      "pagos": [
          { "monto": 500, "divisa": "USD", "tipoCambio": 1 },
          { "monto": 10000, "divisa": "ARS", "tipoCambio": 1100 }
      ],
      "transaccion": { 
          "envioRetiro": "Retiro", 
          "comentarios": "..." 
      },
      "parteDePago": { "esParteDePago": false },
      "trazabilidad": {
          "idOperacion": "...", 
          "fecha": "ISOString...", 
          "usuario": "..." 
      }
    }
    ```
- **Respuesta Exitosa:**
    ```json
    {
      "status": "success",
      "data": { "idOperacion": "OP-xyz", "message": "Venta registrada" }
    }
    ```

### `addProduct`
- **Descripción:** Agrega una nueva configuración de producto (variante/modelo) a la hoja 'Config'.
- **Payload (`request.payload`):**
    ```json
    {
      "categoria": "iPad",
      "modelo": "Pro",
      "variantes": "128GB, 256GB",
      "colores": "Silver, Gray"
    }
    ```
- **Respuesta Exitosa:**
    ```json
    { "status": "success", "data": { "message": "Producto configurado..." } }
    ```

### `updateConfig` (anteriormente `save_config`)
- **Descripción:** Actualiza el ID de la hoja de cálculo vinculada en las `ScriptProperties`.
- **Payload (`request.payload`):** `{ "spreadsheetId": "1A2b3C..." }`
- **Respuesta Exitosa:** `{ "status": "success", "data": { "message": "Configuración guardada..." } }`

### `check_integrity`
- **Descripción:** Verifica que la hoja de cálculo tenga todas las columnas requeridas (Schema) y las crea si faltan.
- **Payload:** `{ "action": "check_integrity", "sheetId": "..." }`
- **Respuesta Exitosa:**
    ```json
    {
      "status": "success",
      "data": { "changes": ["✅ Creada hoja: _LOGS"], "message": "..." }
    }
    ```

### `login` (Legacy)
- **Nota:** La autenticación principal ahora se maneja vía **Clerk** en el frontend. Este endpoint queda como remanente para autenticación básica interna o scripts de mantenimiento.
