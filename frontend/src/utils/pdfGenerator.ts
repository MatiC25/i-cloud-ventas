// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import { IVenta } from '../types';

export const generarPDFVenta = (venta: IVenta, idOperacion: string) => {
  // 1. Crear instancia del documento (orientación vertical, unidad mm, formato a4)
  const doc = new jsPDF('p', 'mm', 'a4');

  // --- CONFIGURACIÓN DE ESTILOS ---
  const margenIzquierdo = 20;
  let cursorY = 20; // Posición vertical inicial

  // Título
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Nota de Compra", margenIzquierdo, cursorY);
  
  cursorY += 15; // Bajamos el cursor

  // --- DATOS DE LA OPERACIÓN ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  // Número de Operación
  doc.text(`N° Operación: ${idOperacion}`, margenIzquierdo, cursorY);
  cursorY += 10;

  // Fecha (Usamos fecha actual)
  const fecha = new Date().toLocaleDateString();
  doc.text(`Fecha: ${fecha}`, margenIzquierdo, cursorY);
  
  // Línea divisoria
  cursorY += 5;
  doc.setLineWidth(0.5);
  doc.line(margenIzquierdo, cursorY, 190, cursorY); // Línea horizontal
  cursorY += 15;

  // --- DATOS DEL CLIENTE ---
  doc.setFont("helvetica", "bold");
  doc.text("Datos del Cliente:", margenIzquierdo, cursorY);
  cursorY += 7;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${venta.cliente.nombre} ${venta.cliente.apellido}`, margenIzquierdo, cursorY);
  // cursorY += 7;
  // doc.text(`Email: ${venta.cliente.email}`, margenIzquierdo, cursorY);

  cursorY += 15;

  // --- DETALLE DEL PRODUCTO ---
  doc.setFont("helvetica", "bold");
  doc.text("Producto Vendido:", margenIzquierdo, cursorY);
  cursorY += 7;

  doc.setFont("helvetica", "normal");
  // Construimos el string del producto (Ej: iPhone 13 - 128GB - Midnight)
  const detalleProducto = `${venta.producto.tipo} ${venta.producto.modelo} ${venta.producto.capacidad ? `- ${venta.producto.capacidad}` : ''} ${venta.producto.color ? `- ${venta.producto.color}` : ''}`;
  doc.text(detalleProducto, margenIzquierdo, cursorY);
  
  if(venta.producto.imei) {
      cursorY += 7;
      doc.setFontSize(10);
      doc.text(`S/N (IMEI): ${venta.producto.imei}`, margenIzquierdo, cursorY);
      doc.setFontSize(12);
  }

  cursorY += 15;

  // --- TOTAL ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  // Alinear a la derecha (aprox 190mm)
  doc.text(`Total: ${venta.transaccion.divisa} $${venta.transaccion.monto}`, 190, cursorY, { align: "right" });

  // --- GUARDAR ARCHIVO ---
  doc.save(`nota-de-compra-${venta.cliente.nombre}.pdf`);
};