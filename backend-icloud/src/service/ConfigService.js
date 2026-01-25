class ConfigService {


    static serviceGetOptions() {
        const ss = getDB();
        const sheet = ss.getSheetByName("D");

        if (!sheet) {
            // Si no existe la hoja "D", devolvemos arrays vacíos para evitar crash
            return {
                metodosPago: [],
                divisas: [],
                tiposDeOperaciones: [],
                tiposDeGastos: [],
                tiposDeProductos: [],
                modelosDeProductos: [],
                capacidadesDeProductos: [],
                coloresDeProductos: [],
                canalesDeVenta: [],
                estadosDeProductos: []
            };
        }

        // Obtenemos todos los datos: filas x columnas
        // Usamos getDataRange para leer solo lo que tiene datos
        const data = sheet.getDataRange().getValues();
        if (data.length < 2) return {}; // Solo headers o vacío

        const headers = data[0].map(h => h.toString().trim());
        const rows = data.slice(1);

        // Mapeo de Nombres de Columna -> Key del Objeto de Respuesta
        // "Header en Excel": "keyEnJson"
        const colMap = {
            "Métodos Pago": "metodosPago",
            "Monedas": "divisas",
            "Tipo de Operación": "tiposDeOperaciones",
            "Tipo de Gastos": "tiposDeGastos",
            "Categoría": "tiposDeProductos",
            "Modelo": "modelosDeProductos",
            "Capacidad": "capacidadesDeProductos",
            "Colores": "coloresDeProductos",
            "Canal de Venta": "canalesDeVenta",
            "Estado": "estadosDeProductos"
        };

        // Inicializamos los Sets para guardar valores únicos
        const resultSets = {};
        Object.values(colMap).forEach(key => resultSets[key] = new Set());

        // Indices de las columnas que nos interesan
        const colIndices = {};
        for (const [header, key] of Object.entries(colMap)) {
            const idx = headers.indexOf(header);
            if (idx !== -1) {
                colIndices[idx] = key;
            }
        }

        // Recorremos las filas y llenamos los Sets
        rows.forEach(row => {
            Object.keys(colIndices).forEach(colIdx => {
                const cellValue = row[colIdx];
                if (cellValue && cellValue.toString().trim() !== "") {
                    const cleanValue = cellValue.toString().trim();
                    const key = colIndices[colIdx];
                    resultSets[key].add(cleanValue);
                }
            });
        });

        // Convertimos Sets a Arrays
        const response = {};
        Object.keys(resultSets).forEach(key => {
            response[key] = Array.from(resultSets[key]);
        });

        return response;
    }

    static serviceSaveConfig(payload) {
        const newId = payload.sheetId;
        PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', newId);
        return { message: "Configuración guardada. El sistema ahora apunta al nuevo Excel." };
    }


    static serviceSaveConfigSheets(payload){

        try {
        const ss = getDB();
        
        if(payload.productos){
            const sheet = ss.getSheetByName("Config_Productos");
            if (!sheet) {
                throw new Error("Hoja 'Config_Productos' no encontrada.");
            }
            
            sheet.appendRow(["Categoria", "Modelo", "Variantes", "Colores"]);
            payload.productos.forEach(producto => {
                sheet.appendRow([producto.categoria, producto.modelo, producto.variantes, producto.colores]);
            });
        }

        if(payload.gastos){
            const sheet = ss.getSheetByName("Config_Gastos");
            if (!sheet) {
                throw new Error("Hoja 'Config_Gastos' no encontrada.");
            }
            
            sheet.appendRow(["Destinos", "Divisas", "Tipo de Movimiento", "Categoria de Movimiento"]);
            payload.gastos.forEach(gasto => {
                sheet.appendRow([gasto.destinos, gasto.divisas, gasto.tipoDeMovimiento, gasto.categoriaDeMovimiento]);
            });
        }

        if(payload.form){
            const sheet = ss.getSheetByName("Config_Form");
            if (!sheet) {
                throw new Error("Hoja 'Config_Form' no encontrada.");
            }
            
            sheet.appendRow(["Canal de Venta", "Estado"]);
            payload.form.forEach(form => {
                sheet.appendRow([form.canalDeVenta, form.estado]);
            });
        }
            return { message: "Configuración guardada correctamente." };
        } catch (error) {
            return { message: "Error al guardar la configuración." };
        }

    }

    /**
     * Guarda las credenciales de Facebook recibidas por API.
     * @param {Object} payload - { fb_token, ad_account_id, sheet_id, admin_key }
     */
    static saveFacebookSettings(payload) {
        const props = PropertiesService.getScriptProperties();
        if (payload.fb_token) {
            props.setProperty('FB_ACCESS_TOKEN', payload.fb_token);
        }

        if (payload.ad_account_id) {
            props.setProperty('FB_AD_ACCOUNT_ID', payload.ad_account_id);
        }

        if (payload.api_version) {
            props.setProperty('FB_API_VERSION', payload.api_version);
        }

        return {
            message: "Configuración de Facebook actualizada correctamente.",
            updated_fields: Object.keys(payload).filter(k => k !== 'admin_key')
        };
    }

    static getFullConfig() {
        const repoProductos = new _GenericRepository("Config_Productos");
        const repoGastos = new _GenericRepository("Config_Gastos");
        const repoForm = new _GenericRepository("Config_Form");

        try {
            const productos = repoProductos.findAllNotReversed();
            const gastos = repoGastos.findAllNotReversed();
            const form = repoForm.findAllNotReversed();

            return {
                productosConfig: productos,
                gastosConfig: gastos,
                formConfig: form
            };

        } catch (error) {
            console.error("Error al obtener la configuración completa:", error);
            throw error; // Let Controller handle the error response
        }
    }

}