// const { apiRequest } = require('./config');

// // Datos de Prueba
// const VENTA_TEST_BASE = {
//     cliente: {
//         nombre: "TestNombre",
//         apellido: "TestApellido",
//         email: "test@example.com",
//         canal: "Instagram",
//         contacto: "@test_user"
//     },
//     productos: [
//         {
//             tipo: "iPhone",
//             modelo: "13 Pro",
//             capacidad: "128GB",
//             color: "Sierra Blue",
//             estado: "Nuevo",
//             imei: "TEST-IMEI-123",
//             cantidad: 1,
//             costo: 500,
//             precio: 900,
//             esParteDePago: false
//         }
//     ],
//     transaccion: {
//         envioRetiro: "Retiro",
//         monto: 900,
//         divisa: "USD",
//         tipoCambio: 1,
//         comentarios: "Venta de Prueba Automatizada"
//     },
//     pagos: [
//         { monto: 900, divisa: "USD", tipoCambio: 1 }
//     ],
//     usuario: "Tester Bot"
// };

// async function testVentas() {
//     console.log("🚀 Iniciando Test de Ventas de Integración\n");

//     // TEST 1: Minorista
//     console.log("🔹 Probando Venta MINORISTA...");
//     try {
//         const payloadMinorista = { ...VENTA_TEST_BASE, tipoVenta: "Minorista" };
//         const resMinorista = await apiRequest("nueva_venta", payloadMinorista);

//         if (resMinorista.status === 'success') {
//             console.log(`✅ Venta Minorista OK. ID Operación: ${resMinorista.data.id_operacion}`);
//         } else {
//             console.error("❌ Venta Minorista Falló:", resMinorista);
//         }
//     } catch (e) {
//         console.error("❌ Error en Venta Minorista:", e);
//     }

//     console.log("\n-----------------------------------\n");

//     // TEST 2: Mayorista
//     console.log("🔹 Probando Venta MAYORISTA...");
//     try {
//         const payloadMayorista = { ...VENTA_TEST_BASE, tipoVenta: "Mayorista" };
//         const resMayorista = await apiRequest("nueva_venta", payloadMayorista);

//         if (resMayorista.status === 'success') {
//             console.log(`✅ Venta Mayorista OK. ID Operación: ${resMayorista.data.id_operacion}`);
//             if (resMayorista.message && resMayorista.message.includes("Sheet: Clientes Mayoristas")) {
//                 console.log("   (Confirmadísimo que fue a la hoja Mayorista por el mensaje de debug/info)");
//             }
//         } else {
//             console.error("❌ Venta Mayorista Falló:", resMayorista);
//         }
//     } catch (e) {
//         console.error("❌ Error en Venta Mayorista:", e);
//     }
// }

// testVentas();
