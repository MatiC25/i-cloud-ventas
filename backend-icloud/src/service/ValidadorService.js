class ValidadorService {

    static validarAdminClerk(sessionId) {
        // 1. Leemos la key
        const SECRET_KEY = PropertiesService.getScriptProperties().getProperty('CLERK_SECRET_KEY');

        // LOG 1: Verificamos si la key se leyó (solo mostramos los primeros 7 chars por seguridad)
        const keyStatus = SECRET_KEY ? `Presente (${SECRET_KEY.substring(0, 7)}...)` : "FALTANTE/NULL";
        Logger.log(`[DEBUG CLERK] Key: ${keyStatus}`);
        Logger.log(`[DEBUG CLERK] SessionID recibido: ${sessionId}`);

        if (!sessionId) return { esAdmin: false, error: "No session ID" };

        try {
            const url = `https://api.clerk.com/v1/sessions/${sessionId}`;
            const options = {
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                muteHttpExceptions: true // Importante para leer el error si es 401/404
            };

            // 2. Hacemos el fetch de Sesión
            const response = UrlFetchApp.fetch(url, options);
            const codigo = response.getResponseCode();
            const textoRespuesta = response.getContentText();
            const data = JSON.parse(textoRespuesta);

            // LOG 2: Ver qué respondió Clerk exactamente
            Logger.log(`[DEBUG CLERK] Respuesta API Session: Código ${codigo}`);
            if (codigo !== 200) {
                Logger.log(`[DEBUG CLERK] Error Body: ${textoRespuesta}`);
                return { esAdmin: false, error: `Clerk rechazó sesión: ${codigo} - ${data.errors?.[0]?.message || 'Desconocido'}` };
            }

            if (data.status !== 'active') {
                return { esAdmin: false, error: `Sesión inactiva. Estado: ${data.status}` };
            }

            // 3. Hacemos el fetch de Usuario
            const userId = data.user_id;
            Logger.log(`[DEBUG CLERK] User ID encontrado: ${userId}. Buscando rol...`);

            const userUrl = `https://api.clerk.com/v1/users/${userId}`;
            const userResponse = UrlFetchApp.fetch(userUrl, options);
            const userData = JSON.parse(userResponse.getContentText());

            const role = userData.public_metadata?.role;
            Logger.log(`[DEBUG CLERK] Rol encontrado: ${role}`);

            if (role === 'admin') {
                return { esAdmin: true, userId: userId };
            } else {
                return { esAdmin: false, error: `Rol insuficiente: ${role}` };
            }

        } catch (e) {
            Logger.log(`[DEBUG CRITICAL] Excepción: ${e.toString()}`);
            return { esAdmin: false, error: e.toString() };
        }
    }

}