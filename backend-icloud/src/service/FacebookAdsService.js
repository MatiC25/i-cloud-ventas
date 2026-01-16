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
            accessToken: props.getProperty('FB_ACCESS_TOKEN'),
            adAccountId: props.getProperty('FB_AD_ACCOUNT_ID'),
            apiVersion:  props.getProperty('FB_API_VERSION')
        };
    }

    /**
 * HELPER: Extrae el conteo de mensajes de la lista de 'actions'
 * Meta devuelve una lista: [{action_type: 'link_click', value: 10}, {action_type: '...messaging...', value: 5}]
 */
    static getMessageCount(actionsArray) {
        if (!actionsArray || !Array.isArray(actionsArray)) return 0;

        const msgAction = actionsArray.find(item =>
            item.action_type === 'onsite_conversion.messaging_conversation_started_7d'
        );

        return msgAction ? parseInt(msgAction.value) : 0;
    }

    static callMetaApi(datePreset = 'yesterday') {
        const props = this.getConfig();

        const fields = 'campaign_name,spend,impressions,clicks,cpc,ctr,actions';
        const url = `https://graph.facebook.com/${props.apiVersion}/${props.adAccountId}/insights?` +
            `level=campaign&` +
            `fields=${fields}&` +
            `date_preset=${datePreset}&` +
            `access_token=${props.accessToken}`;

        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        const json = JSON.parse(response.getContentText());

        if (json.error) {
            throw new Error(`Meta API Error: ${json.error.message}`);
        }

        return json.data || [];
    }

    static updateHourlySnapshot() {
    try {
        // 1. Pedimos datos de 'today'
        const campaigns = this.callMetaApi('today');

        // 2. Calculamos totales en memoria (Sumamos todas las campañas)
        let totalSpend = 0;
        let totalMessages = 0;
        let totalClicks = 0;

        campaigns.forEach(c => {
            totalSpend += parseFloat(c.spend || 0);
            totalClicks += parseInt(c.clicks || 0);
            totalMessages += this.getMessageCount(c.actions);
        });

        // Costo por Mensaje Promedio del Día
        const costPerMessage = totalMessages > 0 ? (totalSpend / totalMessages) : 0;

        const data = {
            fecha: new Date(),
            totalSpend,
            totalMessages,
            totalClicks,
            costPerMessage,
        };

        // 3. Escribir en la Sheet del Dashboard
        const faceRepo = new FacebookRepository();
        faceRepo.save(data);

    } catch (e) {
        console.error("Error en Snapshot Horario:", e.message);
    }
}

    static dailyHistory() {
        try {
            // 1. Obtener datos de AYER
            const campaigns = this.callMetaApi('yesterday');

            if (!campaigns.length) {
                console.log("No hubo actividad ayer.");
                return [{
                    data: "No hay campañas en tu app"
                }];
            }

            // 2. Instanciar el repositorio
            const repo = new HeavyFacebookRepository();
            let guardados = 0;
            const datosGuardados = [];

            // 3. Iterar y Transformar (Mapeo API -> Objeto Repository)
            campaigns.forEach(c => {
                
                // Cálculos auxiliares
                const msgs = this.getMessageCount(c.actions);
                const spend = parseFloat(c.spend || 0);
                // Evitar división por cero en Costo Por Mensaje
                const cpp = msgs > 0 ? (spend / msgs) : 0; 

                // Creamos el objeto plano que espera _GenericRepository.save()
                // Las llaves (keys) de este objeto serán los Encabezados en el Excel
                const rowData = {
                    "Fecha": c.date_start,
                    "ID_Campaña": c.campaign_id, // Útil tener el ID técnico
                    "Nombre_Campaña": c.campaign_name,
                    "Estado": c.status || "",
                    "Gasto": spend,
                    "Impresiones": parseInt(c.impressions || 0),
                    "Clics": parseInt(c.clicks || 0),
                    "CTR": parseFloat(c.ctr || 0),
                    "CPC": parseFloat(c.cpc || 0),
                    "Mensajes (Conv.)": msgs,
                    "Costo Por Mensaje": cpp
                };

                // 4. Guardar usando tu repositorio dinámico
                repo.save(rowData);
                guardados++;
                datosGuardados.push(rowData);
            });

            console.log(`✅ Histórico completado: Se guardaron ${guardados} campañas en HEAVY_FACEBOOK_STATS.`);
            return datosGuardados;

        } catch (e) {
            console.error("🔥 Error en Snapshot Diario:", e.message);
            return [{
            error: true,
            mensaje: e.toString(), 
            linea: e.stack 
        }];
        }
    }

    static testNameFB(){

        const props = this.getConfig();

        const fields = 'id,name';
        const url = `https://graph.facebook.com/${props.apiVersion}/me?fields=${fields}&access_token=${props.accessToken}`;

        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        const json = JSON.parse(response.getContentText());

        if (json.error) {
            throw new Error(`Meta API Error: ${json.error.message}`);
        }

        return json || [];

    }

}
