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
            "Envio | Retiro",
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
            "Comentarios"
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
            "Envio | Retiro": dto.envioRetiro,
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
            "Comentarios": dto.comentarios || ""
        };
    }

    /**
     * Recibe el JSON crudo del Frontend y crea el DTO Interno.
     * Aquí es donde se calcula el ID y se aplanan los datos.
     */
    static toDto(raw) {
        var fechaHoy = new Date();
        
        // Generamos ID
        var id_operacion = IdGenerator.getNextId(SHEET.CLIENTES_MINORISTAS, "N° ID"); 
        
        var montoVenta = Number(raw.transaccion.monto) || 0;
        var costoProd = Number(raw.producto.costo) || 0;
        var tipoCambio = Number(raw.transaccion.tipoCambio) || 1;

        // Lógica de conversión
        var conversion = 0;
        if (raw.transaccion.divisa === "ARS" && tipoCambio > 0) {
            conversion = montoVenta / tipoCambio;
        } else {
            conversion = montoVenta;
        }

        // RETORNAMOS UN OBJETO PLANO
        return {
            id: id_operacion,
            fecha: fechaHoy,
            mes: fechaHoy.getMonth() + 1,
            
            // Cliente
            nombreCompleto: (raw.cliente.nombre + " " + raw.cliente.apellido).trim(),
            canal: raw.cliente.canal,
            contacto: raw.cliente.contacto,
            email: raw.cliente.email,

            // Producto
            cantidad: raw.producto.cantidad || 1,
            tipoProducto: raw.producto.tipo,
            modelo: raw.producto.modelo,
            capacidad: raw.producto.capacidad,
            color: raw.producto.color,
            estado: raw.producto.estado,
            imei: raw.producto.imei,
            
            // Transacción
            envioRetiro: raw.transaccion.envioRetiro,
            monto: montoVenta,
            divisa: raw.transaccion.divisa,
            
            // Parte de Pago
            ppTipo: raw.parteDePago.esParteDePago ? raw.parteDePago.tipo : "",
            ppModelo: raw.parteDePago.esParteDePago ? raw.parteDePago.modelo : "",
            ppCapacidad: raw.parteDePago.esParteDePago ? raw.parteDePago.capacidad : "",
            ppImei: raw.parteDePago.esParteDePago ? raw.parteDePago.imei : "",
            ppCosto: raw.parteDePago.esParteDePago ? raw.parteDePago.costo : 0,
            
            // Financiero
            tipoCambio: tipoCambio,
            conversion: raw.parteDePago.esParteDePago ? conversion : "", 
            costoProducto: costoProd,
            profit: conversion - costoProd,
            comentarios: raw.transaccion.comentarios
        };
    }
}