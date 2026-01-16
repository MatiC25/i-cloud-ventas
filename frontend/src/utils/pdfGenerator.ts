// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import { IVenta } from '../types';

export const generarPDFVenta = (venta: IVenta, idOperacion: string) => {
  // 1. Crear instancia del documento (orientación vertical, unidad mm, formato a4)
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.text("Nota de Compra", 10, 10);
  doc.save(`nota-de-compra-${venta.cliente.nombre}.pdf`);
};