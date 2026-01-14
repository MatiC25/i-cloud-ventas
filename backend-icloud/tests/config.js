// // CONFIGURACIÓN DE TESTS
// // Reemplaza esta URL con la de tu despliegue (Manage Deployments > Web App > URL)
// // O crea un archivo .env en backend-icloud con: GOOGLE_SCRIPT_URL=...

// require("dotenv").config();

// const API_URL = process.env.GOOGLE_SCRIPT_URL

// async function apiRequest(action, payload = null) {
//     if (API_URL.includes("AKfycbz...")) {
//         console.error("❌ ERROR: Debes configurar la API_URL en tests/config.js");
//         process.exit(1);
//     }

//     try {
//         const response = await fetch(API_URL, {
//             method: "POST",
//             redirect: "follow", // Importante para GAS
//             headers: {
//                 "Content-Type": "text/plain;charset=utf-8",
//             },
//             body: JSON.stringify({
//                 action,
//                 payload,
//             }),
//         });

//         const text = await response.text();
//         try {
//             return JSON.parse(text);
//         } catch (e) {
//             console.error("Error al parsear JSON:", text);
//             throw e;
//         }
//     } catch (error) {
//         console.error("Error de Red:", error);
//         throw error;
//     }
// }

// module.exports = {
//     apiRequest,
//     API_URL
// };
