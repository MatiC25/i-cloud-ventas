/**
 * Servicio para integrar Google Apps Script con la Marketing API de Meta (Facebook Ads).
 * Permite consultar el gasto publicitario y registrarlo automáticamente en el sistema.
 */
class FacebookAdsService {

    /**
     * Obtiene la configuración de Keys.
     * Se recomienda usar PropertiesService para no hardcodear credenciales.
     */
    static getConfig() {
        const props = PropertiesService.getScriptProperties();
        return {
            accessToken: props.getProperty('FB_ACCESS_TOKEN') || 'TU_ACCESS_TOKEN_AQUI',
            adAccountId: props.getProperty('FB_AD_ACCOUNT_ID') || 'act_TU_ID_AQUI', // Debe empezar con 'act_'
            apiVersion: 'v18.0'
        };
    }

    /**
     * Consulta el gasto del día específico o del rango dado.
     * @param {Date} [startDate] - Fecha inicio (default: hoy).
     * @param {Date} [endDate] - Fecha fin (default: hoy).
     * @returns {number} Gasto total en la moneda de la cuenta publicitaria.
     */
    static fetchDailySpend(startDate = new Date(), endDate = new Date()) {
        const config = this.getConfig();

        if (config.accessToken === 'TU_ACCESS_TOKEN_AQUI') {
            console.warn("⚠️ FB_ACCESS_TOKEN no configurado. Retornando 0 gasto ficticio.");
            return 0; // Fallback para evitar errores si no hay credenciales
        }

        const timeRange = {
            since: Utilities.formatDate(startDate, "GMT", "yyyy-MM-dd"),
            until: Utilities.formatDate(endDate, "GMT", "yyyy-MM-dd")
        };

        // Construir URL
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.adAccountId}/insights?` +
            `level=account&` +
            `fields=spend,currency&` +
            `time_range=${encodeURIComponent(JSON.stringify(timeRange))}&` +
            `access_token=${config.accessToken}`;

        try {
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const json = JSON.parse(response.getContentText());

            if (json.error) {
                console.error("Error Facebook API:", json.error.message);
                throw new Error("Facebook API Error: " + json.error.message);
            }

            if (json.data && json.data.length > 0) {
                // Facebook devuelve strings, ej: "150.50"
                return parseFloat(json.data[0].spend) || 0;
            }

            return 0;
        } catch (e) {
            console.error("Excepción en fetchDailySpend:", e);
            return 0;
        }
    }

    /**
     * Sincroniza el gasto de AYER (o HOY) al Libro Diario.
     * Ideal para correr con un Trigger diario a ultima hora o al día siguiente temprano.
     * @param {boolean} [forceToday] - Si es true, fuerza la carga de hoy.
     */
    static syncAdsSpend(forceToday = true) {
        const dateProcesar = new Date();
        // Si no forzamos hoy, procesamos ayer (común en cron jobs nocturnos)
        if (!forceToday) {
            dateProcesar.setDate(dateProcesar.getDate() - 1);
        }

        const spend = this.fetchDailySpend(dateProcesar, dateProcesar);

        if (spend > 0) {
            this.registrarGastoEnLibro(spend, dateProcesar);
            return `Sincronizado gasto de Facebook Ads: $${spend}`;
        } else {
            return "Sin gasto publicitario registrado o API no configurada.";
        }
    }

    /**
     * Registra el gasto en la hoja "Libro Diario".
     * Verifica duplicados para no repetir el gasto del mismo día.
     */
    static registrarGastoEnLibro(monto, fecha) {
        const ss = getDB();
        let sheet = ss.getSheetByName("Libro Diario");

        if (!sheet) return; // Validación básica

        // 1. Revisar si ya existe un gasto de "Inversión Publicitaria" para esa fecha
        const data = sheet.getDataRange().getValues();
        const headers = GastosMapper.getHeadersPrincipal();

        const idxFecha = headers.indexOf("Fecha");
        const idxTipo = headers.indexOf("Tipo de Movimiento");
        const idxDetalle = headers.indexOf("Detalle"); // Opcional, para refinar

        if (idxFecha === -1 || idxTipo === -1) return;

        const fechaStr = Utilities.formatDate(fecha, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");

        const yaExiste = data.slice(1).some(row => {
            const rowDate = row[idxFecha];
            if (!(rowDate instanceof Date)) return false; // si está vacio
            const rowDateStr = Utilities.formatDate(rowDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
            const rowTipo = row[idxTipo];

            return rowDateStr === fechaStr && rowTipo === "Inversión Publicitaria";
        });

        if (yaExiste) {
            console.log("El gasto de Facebook Ads para hoy ya fue registrado.");
            return;
        }

        // 2. Insertar
        // Payload simulado para usar el servicio existente o insertar directo
        // Usamos serviceNuevaOperacion para mantener consistencia de IDs y lógica
        const payload = {
            fecha: fecha,
            detalle: "Gasto Diario Meta Ads",
            tipo: "Inversión Publicitaria",
            categoria: "Marketing",
            monto: monto,
            divisa: "USD", // Asumimos USD si la cuenta está en USD, o parametrizar
            destino: "Tarjeta Corporativa", // Default
            comentarios: "Sincronización Automática API",
            usuario: "Sistema Bot"
        };

        serviceNuevaOperacion(payload);
    }
}
