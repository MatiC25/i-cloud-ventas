import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IVenta } from '../types';

const firmaBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO0AAAC9CAYAAABfw/p4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA/ESURBVHhe7ZxJqCRVFoadZ1CccUbEeUDdiIiKWmitVGxRUKmN4KJBFyUt6KLshQuFEkUty2mjJQgODYqCrbiRLhE3VSIKWu1CRQpdKFSJExrdf1ac8OR9EfkiIvNl3pP5fXB4L+PeiIzMii/OufdGvd0KAAgF0gIEA2kBgoG0AMFAWoBgIC1AMJAWIBhICxAMpAUIBtICBANpAYKBtADBQFqAYCAtQDCQFiAYSAsQDKQFCAbSAgQDaQGCgbQAwUBagGAgLUAwkBYgGEgLEAykBQgG0gIEA2kBgoG0AMFAWoBgIC1AMJAWIBhICxCMrKT94IMPioMPPrh17Ny5c7DftddeW2274YYbBtsM3+bjkEMOKU4++eTi0ksvLR544IHim2++KfcY5rDDDhv018/PPvus3DqaN998s3qfSy65pNxajz7D8ccfX/W/6KKLyhaAerKS9v333y9222231rFjx47BfldeeWW17eqrrx5sM3zbqDjooIOK5557rtzrL/bcc8+qzxVXXFFubebXX38tTjnllGqf8847r2yp57HHHqv6WrzzzjtlK8BSspb2xBNPLE477bTG+Omnnwb7tZV23333LY499thBHH300cUee+xRtSl233334o033ij33IWXVvHSSy+VLfUoa/v+5557btmylD/++GNIcIvVq1eXPQCWkrW0Kpfb0FbatO23334rXnjhhWL//fev+qSSpdIec8wxVYZP+frrr4sDDzxwqP8oaV977bWh49p76ebx6aeflr0AhlloaY1169ZVfRTbt28vW5ZKq1i7dm3ZOsyNN964pO8555xTti5F413r9+CDDxbXX3999fr2228vewEMg7T/5+WXX676KLZs2VK21Eu71157FZ988knZYxfvvffekn6KJmk/+uijqo/K9u+//34wlrVt++23X/Hdd9+VvQH+Imtpn3322YG4dfHLL7+Ue40v7X333Vf1UXhZvLQS0H6/7LLLyh5F8fvvvxdnnXVW1bZq1arq97PPPrvsNczNN99c9bntttvKrcVgrG7b77///nIrwF9kLe2o+OKLL8q9+kv7888/D2aMlems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"

export const generarPDFVenta = (venta: IVenta, idOperacion: string) => {
  // 1. Inicializar documento
  const doc = new jsPDF('p', 'mm', 'a4');

  // Colores corporativos (Gris oscuro para textos, gris claro para fondos)
  const colorTexto = '#333333';
  const colorBorde = '#e0e0e0';

  // --- HEADER ---
  // Logo (Texto iConnect simulando logo)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(colorTexto);
  doc.text("iConnect", 15, 20);

  // Título del documento
  doc.setFontSize(16);
  doc.setTextColor('#666666');
  doc.text("NOTA DE COMPRA", 195, 20, { align: 'right' });

  // Línea separadora header
  doc.setDrawColor(colorBorde);
  doc.line(15, 25, 195, 25);

  // --- INFO FACTURA (Caja derecha) ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colorTexto);

  const fechaVenta = new Date().toLocaleDateString('es-AR');
  // Usamos el ID corto o el que pases por parámetro
  const nroFactura = idOperacion.slice(-8).toUpperCase();

  // Dibujar datos de factura alineados a la derecha
  doc.text(`Factura N°: ${nroFactura}`, 195, 35, { align: 'right' });
  doc.text(`Fecha: ${fechaVenta}`, 195, 40, { align: 'right' });


  // --- INFO CLIENTE (Izquierda) ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL CLIENTE", 15, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  // Validamos que existan los datos para no imprimir "undefined"
  const nombreCliente = venta.cliente?.nombre ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}` : 'Consumidor Final';

  doc.text(`Cliente: ${nombreCliente}`, 15, 42);

  // --- TABLA DE PRODUCTOS ---
  // Preparamos los datos para autoTable
  const tableBody = venta.productos.map((prod) => [
    `${prod.tipo} ${prod.modelo} ${prod.capacidad} ${prod.color || ''}`, // Descripción
    `$${Number(prod.precio).toLocaleString()}`,                          // Precio Unitario
    prod.cantidad.toString(),                                            // Cantidad
    `$${(Number(prod.precio) * Number(prod.cantidad)).toLocaleString()}` // Total Renglón
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['DESCRIPCIÓN', 'PRECIO', 'CANTIDAD', 'TOTAL']],
    body: tableBody,
    theme: 'plain', // Estilo minimalista como tu PDF
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: colorTexto,
    },
    headStyles: {
      fillColor: '#f3f4f6', // Fondo gris claro para cabecera
      textColor: '#111827', // Texto oscuro cabecera
      fontStyle: 'bold',
      halign: 'center' // Encabezados centrados
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'center' }, // Descripción centrada
      1: { halign: 'center' },   // Precio centrado
      2: { halign: 'center' },   // Cantidad centrada
      3: { halign: 'center', fontStyle: 'bold' } // Total centrado y negrita
    },
    // Dibujar líneas solo abajo de cada fila (estilo clean)
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        // Opcional: Personalización extra si quisieras bordes
      }
    }
  });

  // --- TOTALES ---
  // Obtenemos la posición Y donde terminó la tabla
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const totalFormateado = venta.productos.reduce((total, prod) => total + (prod.precio * prod.cantidad), 0) ? `$${Number(venta.productos.reduce((total, prod) => total + (prod.precio * prod.cantidad), 0)).toLocaleString()} USD` : '$0 USD';

  doc.text(`TOTAL:  ${totalFormateado}`, 195, finalY, { align: 'right' });


  const pageHeight = doc.internal.pageSize.height;

  // Ajustamos la posición Y para que la firma quede bien al pie
  const footerY = pageHeight - 40;

  doc.setDrawColor('#000000');
  doc.line(70, footerY, 140, footerY);

  // 2. Insertar la Imagen
  // doc.addImage(imgData, format, x, y, width, height)
  // Ajusta 'width' y 'height' según la proporción de tu imagen para que no se deforme.
  const imgWidth = 40;
  const imgHeight = 25;
  const xPos = 105 - (imgWidth / 2); // Calculamos el centro (105mm es la mitad de A4) restando la mitad del ancho de la img

  // Importante: 'PNG' o 'JPEG' dependiendo de tu imagen base64
  doc.addImage(firmaBase64, 'PNG', xPos, footerY - 30, imgWidth, imgHeight);

  // 3. Texto debajo de la firma
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor('#000000');
  doc.text("Fabrizio Gilgora", 105, footerY + 5, { align: 'center' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor('#999999');
  doc.text("Firma Autorizada", 105, footerY + 10, { align: 'center' });

  // 4. Guardar PDF
  const fileName = `nota-compra-${nombreCliente.replace(/\s+/g, '_')}-${nroFactura}.pdf`;
  doc.save(fileName);
};