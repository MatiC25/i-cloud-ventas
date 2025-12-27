/**
 * Clase encargada de traducir DTOs
 * a Entidades de Excel
 */

class VentaMapper {
    /**
     * Convierte el DTO de venta a un objeto con nombres de columnas
     * @param {Object} dto - Datos que vienen del frontend
     * @returns {Object} - Objeto { "Header Excel": "Valor"}
     */
    static toExcel(dto){
     
        const fechaHoy = new Date();
        const id_operacion = IdGenerator.getNextId("Clientes Minoristas", "N° ID");
        const montoVenta = Number(dto.transaccion.monto) || 0;
        const costoProd = Number(dto.producto.costo) || 0;
        const tipoCambio = Number(dto.transaccion.tipoCambio) || 1;

        // Cálculo de conversión (Si vendes en ARS, cuánto es en USD)
        let conversion = 0;
        if (dto.transaccion.divisa === "ARS" && tipoCambio > 0) {
            conversion = montoVenta / tipoCambio;
        } else {
            conversion = montoVenta; // Si ya es USD
        }

        return {
        "Fecha": fechaHoy,
        "Mes": fechaHoy.getMonth() + 1, // getMonth devuelve 0-11, sumamos 1
        "N° ID": id_operacion,
        
        // --- CLIENTE ---
        "Nombre y Apellido": `${dto.cliente.nombre} ${dto.cliente.apellido}`.trim(),
        "Canal": dto.cliente.canal,
        "Contacto": dto.cliente.contacto,
        "Mail": dto.cliente.email,

        // --- PRODUCTO ---
        "Cantidad": dto.producto.cantidad,
        "Equipo | Producto": dto.producto.tipo,
        "Modelo": dto.producto.modelo,
        "Tamaño": dto.producto.capacidad,
        "Color": dto.producto.color,
        "Estado": dto.producto.estado,
        "IMEI | Serial": dto.producto.imei,
        
        // --- TRANSACCIÓN ---
        "Envio | Retiro": dto.transaccion.envioRetiro,
        "Monto": montoVenta,
        "Divisa": dto.transaccion.divisa,


        
        // --- PARTE DE PAGO (Solo si aplica) ---
        "Equipo en parte de pago": dto.parteDePago.esParteDePago ? dto.parteDePago.tipo : "",
        "Modelo del equipo": dto.parteDePago.esParteDePago ? dto.parteDePago.modelo : "",
        "Capacidad": dto.parteDePago.esParteDePago ? dto.parteDePago.capacidad : "",
        "IMEI": dto.parteDePago.esParteDePago ? dto.parteDePago.imei : "",
        "Costo del Equipo en Parte de pago": dto.parteDePago.esParteDePago ? dto.parteDePago.costo : 0,
        "Tipo de Cambio": dto.parteDePago.esParteDePago ? tipoCambio : "",
        "Conversión $ARS - USD": dto.parteDePago.esParteDePago ? conversion : "", 

        // --- RESULTADOS FINANCIEROS ---
        "Costo del Producto": costoProd,
        "Profit Bruto": conversion - costoProd, 
        "Comentarios": dto.transaccion.comentarios
        };
    }

    static toDto(dto) {
        var fechaHoy = new Date();
        
        // Generamos ID (Asegúrate de que IdGenerator use openById también)
        // Nota: Pasamos el nombre de la hoja donde se guardará
        var id_operacion = IdGenerator.getNextId("Clientes Minoristas", "N° ID"); 
        
        var montoVenta = Number(dto.transaccion.monto) || 0;
        var costoProd = Number(dto.producto.costo) || 0;
        var tipoCambio = Number(dto.transaccion.tipoCambio) || 1;

        // Lógica de conversión
        var conversion = 0;
        if (dto.transaccion.divisa === "ARS" && tipoCambio > 0) {
            conversion = montoVenta / tipoCambio;
        } else {
            conversion = montoVenta;
        }

        // RETORNAMOS UN OBJETO LIMPIO (Internal DTO)
        // Las claves aquí son para TU uso interno en el código, no para el Excel.
        return {
        id: id_operacion,
        fecha: fechaHoy,
        mes: fechaHoy.getMonth() + 1,
        
        // Cliente
        nombreCompleto: (dto.cliente.nombre + " " + dto.cliente.apellido).trim(),
        canal: dto.cliente.canal,
        contacto: dto.cliente.contacto,
        email: dto.cliente.email,

        // Producto
        cantidad: dto.producto.cantidad,
        tipoProducto: dto.producto.tipo,
        modelo: dto.producto.modelo,
        capacidad: dto.producto.capacidad,
        color: dto.producto.color,
        estado: dto.producto.estado,
        imei: dto.producto.imei,
        
        // Transacción
        envioRetiro: dto.transaccion.envioRetiro,
        monto: montoVenta,
        divisa: dto.transaccion.divisa,
        
        // Parte de Pago
        esPartePago: dto.parteDePago.esParteDePago, // Flag útil
        ppTipo: dto.parteDePago.esParteDePago ? dto.parteDePago.tipo : "",
        ppModelo: dto.parteDePago.esParteDePago ? dto.parteDePago.modelo : "",
        ppCapacidad: dto.parteDePago.esParteDePago ? dto.parteDePago.capacidad : "",
        ppImei: dto.parteDePago.esParteDePago ? dto.parteDePago.imei : "",
        ppCosto: dto.parteDePago.esParteDePago ? dto.parteDePago.costo : 0,
        
        // Financiero
        tipoCambio: tipoCambio,
        conversion: dto.parteDePago.esParteDePago ? conversion : "", // Ojo con esta lógica de negocio
        costoProducto: costoProd,
        profit: conversion - costoProd,
        comentarios: dto.transaccion.comentarios
        };
    }
}
