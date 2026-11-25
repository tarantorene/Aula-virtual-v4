// Código único + QR de verificación para los certificados, y certificado anual del plan de 40 horas
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const urlVerificacion = (codigo: string) => `${window.location.origin}${window.location.pathname}?verificar=${codigo}`;

/** Dibuja el QR y el código de verificación en la esquina inferior izquierda de un certificado A4 horizontal. */
export async function agregarVerificacion(doc: jsPDF, codigo: string, x = 34, y = 160) {
  const qr = await QRCode.toDataURL(urlVerificacion(codigo), { margin: 0, width: 280, color: { dark: '#0B1F3F' } });
  doc.addImage(qr, 'PNG', x, y, 24, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 31, 63);
  doc.text(`Código: ${codigo}`, x + 12, y + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Verifique escaneando el QR', x + 12, y + 31, { align: 'center' });
}

interface DatosPlan {
  nombre: string;
  cedula: string;
  plan: string;
  horas: number;
  virtuales: number;
  presenciales: number;
  codigo: string;
  cursos: string[];
  firmaNombre: string;
  firmaCargo: string;
  modo?: 'descargar' | 'imprimir';
}

const NAVY: [number, number, number] = [11, 31, 63];
const ORO: [number, number, number] = [197, 168, 128];

/** Certificado anual de cumplimiento del plan de capacitación en igualdad (MDT-2025-006). */
export async function generarCertificadoPlan(d: DatosPlan) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(9, 9, W - 18, H - 18, 'F');
  doc.setDrawColor(...ORO);
  doc.setLineWidth(0.8);
  doc.rect(13, 13, W - 26, H - 26, 'S');

  // Logotipo: tres rombos + FUNDAMETZ
  const rombo = (x: number, y: number, r: number) => doc.lines([[r, r], [-r, r], [-r, -r], [r, -r]], x, y - r, [1, 1], 'F', true);
  doc.setFillColor(...NAVY);
  rombo(W / 2, 25, 3.4); rombo(W / 2 - 3.8, 28.8, 3.4); rombo(W / 2 + 3.8, 28.8, 3.4);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...NAVY);
  doc.text('FUNDAMETZ', W / 2, 41, { align: 'center' });

  doc.setFont('times', 'italic'); doc.setFontSize(15); doc.setTextColor(...ORO);
  doc.text('CERTIFICADO DE', W / 2, 55, { align: 'center' });
  doc.setFont('times', 'bold'); doc.setFontSize(30); doc.setTextColor(...NAVY);
  doc.text('CUMPLIMIENTO DEL PLAN DE CAPACITACIÓN', W / 2, 68, { align: 'center' });

  doc.setFont('times', 'normal'); doc.setFontSize(12); doc.setTextColor(60, 70, 85);
  doc.text('La Empresa Fundametz certifica que el colaborador(a):', W / 2, 80, { align: 'center' });
  doc.setFont('times', 'bolditalic'); doc.setFontSize(24); doc.setTextColor(...ORO);
  doc.text(d.nombre.toUpperCase(), W / 2, 93, { align: 'center' });
  doc.setDrawColor(...ORO); doc.setLineWidth(0.6); doc.line(55, 96, W - 55, 96);

  doc.setFont('times', 'normal'); doc.setFontSize(11.5); doc.setTextColor(...NAVY);
  doc.text(`con cédula de identidad N.° ${d.cedula}, completó el ${d.plan} con un total de`, W / 2, 106, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text(`${d.horas} HORAS`, W / 2, 118, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 90, 105);
  doc.text(`${d.virtuales} h en modalidad virtual · ${d.presenciales} h en sesiones presenciales`, W / 2, 124, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(`Cursos aprobados: ${d.cursos.join(' · ')}.`, 210), W / 2, 133, { align: 'center' });
  doc.text('Capacitación en igualdad y no discriminación conforme al Acuerdo Ministerial MDT-2025-006.', W / 2, 146, { align: 'center' });

  // Firma
  doc.setDrawColor(...NAVY); doc.setLineWidth(0.4); doc.line(W / 2 - 40, 172, W / 2 + 40, 172);
  doc.setFont('times', 'bolditalic'); doc.setFontSize(11); doc.setTextColor(...ORO);
  doc.text(d.firmaCargo.toUpperCase(), W / 2, 178, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...NAVY);
  doc.text(d.firmaNombre.toUpperCase(), W / 2, 183, { align: 'center' });

  doc.setFont('times', 'italic'); doc.setFontSize(9.5);
  doc.text(`Otorgado en Guayaquil, Ecuador, el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}.`, W - 22, 190, { align: 'right' });

  await agregarVerificacion(doc, d.codigo, 24, 158);
  entregarPdf(doc, `Certificado_Plan_${d.nombre.replace(/\s+/g, '_')}_${d.codigo}.pdf`, d.modo);
}

/** Descarga el PDF o lo abre en una pestaña nueva listo para imprimir. */
export function entregarPdf(doc: jsPDF, nombreArchivo: string, modo: 'descargar' | 'imprimir' = 'descargar') {
  if (modo === 'imprimir') {
    doc.autoPrint();
    const url = doc.output('bloburl');
    const ventana = window.open(url, '_blank');
    if (!ventana) doc.save(nombreArchivo); // si el navegador bloquea la ventana, se descarga
    return;
  }
  doc.save(nombreArchivo);
}
