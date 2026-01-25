class VentaMapper {

    /**
     * FUENTE DE VERDAD: Define las columnas y su orden exacto.
     */
    static getHeaders() {
        return [
            "Fecha",
            "Mes",
            "N° ID",
            // --- CLIENTE ---
            "Nombre y Apellido",
            "Canal",
            "Contacto",
            "Mail",
            // --- PRODUCTO ---
            "Cantidad",
            "Equipo | Producto",
            "Modelo",
            "Tamaño",
            "Color",
            "Estado",
            "IMEI | Serial",
            // --- TRANSACCIÓN ---
            "Envío | Retiro",
            "Monto",
            "Divisa",
            // --- PARTE DE PAGO ---
            "Equipo en parte de pago",
            "Modelo del equipo",
            "Capacidad",
            "IMEI",
            "Costo del Equipo en Parte de pago",
            "Tipo de Cambio",
            "Conversión $ARS - USD",
            // --- RESULTADOS FINANCIEROS ---
            "Costo del Producto",
            "Profit Bruto",
            "Comentarios",
            // --- TOTALES MULTIMONEDA ---
            "Total en Pesos",
            "Total en Dolares",
            "Auditoría"
        ];
    }

    /**
     * Convierte el DTO Interno (ya procesado) a formato Excel.
     * @param {Object} dto - Objeto plano que devuelve toDto()
     */
    static toExcel(dto) {
        // Formateo de fechas
        const fechaObj = new Date(dto.fecha); // Aseguramos que sea objeto Date

        return {
            "Fecha": fechaObj,
            "Mes": dto.mes,
            "N° ID": dto.id, // Usamos el ID que ya generó toDto

            // --- CLIENTE ---
            "Nombre y Apellido": dto.nombreCompleto,
            "Canal": dto.canal,
            "Contacto": dto.contacto,
            "Mail": dto.email,

            // --- PRODUCTO ---
            "Cantidad": dto.cantidad,
            "Equipo | Producto": dto.tipoProducto,
            "Modelo": dto.modelo,
            "Tamaño": dto.capacidad,
            "Color": dto.color,
            "Estado": dto.estado,
            "IMEI | Serial": dto.imei,

            // --- TRANSACCIÓN ---
            "Envío | Retiro": dto.envioRetiro,
            "Monto": dto.monto,
            "Divisa": dto.divisa,

            // --- PARTE DE PAGO ---
            "Equipo en parte de pago": dto.ppTipo || "",
            "Modelo del equipo": dto.ppModelo || "",
            "Capacidad": dto.ppCapacidad || "",
            "IMEI": dto.ppImei || "",
            "Costo del Equipo en Parte de pago": dto.ppCosto || 0,
            "Tipo de Cambio": dto.tipoCambio || "",
            "Conversión $ARS - USD": dto.conversion || "",

            // --- RESULTADOS FINANCIEROS ---
            "Costo del Producto": dto.costoProducto || 0,
            "Profit Bruto": dto.profit || 0,
            "Comentarios": dto.comentarios || "",

            // --- TOTALES MULTIMONEDA ---
            "Total en Pesos": dto.totalPesos || "",
            "Total en Dolares": dto.totalDolares || "",
            "Auditoría": dto.auditoria || ""
        };
    }

    /**
     * Recibe el JSON crudo del Frontend y crea el DTO Interno.
     * Aquí es donde se calcula el ID y se aplanan los datos.
     * @param {Object} raw Payload
     * @param {number|null} idOverride ID forzado (para multiples productos en una venta)
     */
    static toDto(raw, idOverride) {
        var fechaHoy = new Date();

        const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        var mesActual = MONTHS[fechaHoy.getMonth()];

        // Generamos ID solo si no viene forzado
        var id_operacion = idOverride || IdGenerator.getNextId(SHEET.CLIENTES_MINORISTAS, "N° ID");

        var montoVenta = Number(raw.transaccion.monto) || 0;
        var tipoCambio = Number(raw.transaccion.tipoCambio) || 0;

        // Safely access sub-objects
        var prod = raw.producto || {};
        var pdp = raw.parteDePago || {};
        var pagos = raw.pagos || []; // Array de pagos
        var esParteDePago = pdp.esParteDePago === true;

        var cantidad = Number(prod.cantidad) || 1; // Fix: Define cantidad variable
        var costoProd = Number(prod.costo) || 0;

        // Lógica de conversión legacy (solo para referencia o cálculo de profit unitario si aplica)
        var conversion = 0;
        if (raw.transaccion.divisa === "ARS" && tipoCambio > 0) {
            conversion = montoVenta / tipoCambio;
        }

        // --- CÁLCULO DE TOTALES POR DIVISA ---
        var totalPesos = 0;
        var totalDolares = 0;

        pagos.forEach(function (pago) {
            var monto = Number(pago.monto) || 0;
            if (pago.divisa === "ARS" || pago.divisa === "UYU" || pago.divisa === "Pesos") {
                totalPesos += monto;
            } else if (pago.divisa === "USD") {
                totalDolares += monto;
            }
        });

        // RETORNAMOS UN OBJETO PLANO
        return {
            id: id_operacion,
            fecha: fechaHoy,
            mes: mesActual,

            // Cliente
            nombreCompleto: (raw.cliente.nombre + " " + raw.cliente.apellido).trim(),
            canal: raw.cliente.canal,
            contacto: raw.cliente.contacto,
            email: raw.cliente.email,

            // Producto (Si es un ítem de venta, llenamos. Si es empty, queda vacío)
            cantidad: cantidad,
            tipoProducto: prod.tipo || "",
            modelo: prod.modelo || "",
            capacidad: prod.capacidad || "",
            color: prod.color || "",
            estado: prod.estado || "",
            imei: prod.imei || "",

            // Transacción
            envioRetiro: raw.transaccion.envioRetiro,
            monto: montoVenta,
            divisa: raw.transaccion.divisa,
            metodoPago: raw.transaccion.metodoPago || "",

            // Parte de Pago (Solo si esParteDePago es true)
            ppTipo: esParteDePago ? pdp.tipo : "",
            ppModelo: esParteDePago ? pdp.modelo : "",
            ppCapacidad: esParteDePago ? pdp.capacidad : "",
            ppImei: esParteDePago ? pdp.imei : "",
            ppCosto: esParteDePago ? pdp.costo : 0,

            // Financiero
            tipoCambio: tipoCambio,
            conversion: conversion,
            costoProducto: costoProd,
            profit: totalDolares - (costoProd * cantidad) > 0 ? totalDolares - (costoProd * cantidad) : prod.profit,
            comentarios: raw.transaccion.comentarios,

            // Totales
            totalPesos: totalPesos > 0 ? totalPesos : 0,
            totalDolares: totalDolares > 0 ? totalDolares + conversion : 0,
            auditoria: raw.usuario || "",
        };
    }
}