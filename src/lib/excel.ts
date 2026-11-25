// Exportación e importación de Excel (se carga bajo demanda para no pesar en el aula)

export interface Columna<T> {
  titulo: string;
  valor: (fila: T) => string | number | Date | null | undefined;
  ancho?: number;
  formato?: string; // p. ej. '0.0' o 'dd/mm/yyyy'
}

export interface Hoja<T> {
  nombre: string;
  titulo?: string;
  columnas: Columna<T>[];
  filas: T[];
}

const AZUL = 'FF1E2B37';

function descargar(buffer: ArrayBuffer, nombre: string) {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exportarExcel(nombreArchivo: string, hojas: Hoja<any>[]) {
  const ExcelJS = (await import('exceljs')).default;
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Aula Virtual Fundametz';
  libro.created = new Date();

  for (const h of hojas) {
    const ws = libro.addWorksheet(h.nombre.slice(0, 31));
    let filaInicio = 1;
    if (h.titulo) {
      ws.mergeCells(1, 1, 1, h.columnas.length);
      const c = ws.getCell(1, 1);
      c.value = h.titulo;
      c.font = { bold: true, size: 14, color: { argb: AZUL } };
      ws.getCell(2, 1).value = `Generado: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`;
      ws.getCell(2, 1).font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
      filaInicio = 4;
    }
    const enc = ws.getRow(filaInicio);
    h.columnas.forEach((col, i) => {
      const c = enc.getCell(i + 1);
      c.value = col.titulo;
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
      c.alignment = { vertical: 'middle', wrapText: true };
      ws.getColumn(i + 1).width = col.ancho ?? 16;
      if (col.formato) ws.getColumn(i + 1).numFmt = col.formato;
    });
    enc.height = 30;
    h.filas.forEach((f, r) => {
      const fila = ws.getRow(filaInicio + 1 + r);
      h.columnas.forEach((col, i) => { fila.getCell(i + 1).value = col.valor(f) ?? null; });
      if (r % 2 === 1) fila.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; });
    });
    ws.views = [{ state: 'frozen', ySplit: filaInicio }];
    ws.autoFilter = { from: { row: filaInicio, column: 1 }, to: { row: filaInicio, column: h.columnas.length } };
  }
  descargar(await libro.xlsx.writeBuffer() as ArrayBuffer, nombreArchivo);
}

export interface FilaImportada {
  cedula: string;
  nombres: string;
  apellidos: string;
  sexo: 'M' | 'F' | null;
  area: string;
  autoridad: boolean;
}

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');

/** Lee la primera hoja de un Excel con columnas: Cédula, Nombres, Apellidos, Sexo, Área, Máxima autoridad. */
export async function leerColaboradores(archivo: File): Promise<FilaImportada[]> {
  const ExcelJS = (await import('exceljs')).default;
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(await archivo.arrayBuffer());
  const ws = libro.worksheets[0];
  if (!ws) return [];

  const texto = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'object' && v && 'text' in v) return String((v as { text: unknown }).text);
    if (typeof v === 'object' && v && 'result' in v) return String((v as { result: unknown }).result);
    return String(v);
  };

  // Busca la fila de encabezados en las primeras 10 filas
  let filaEnc = 1;
  const mapa: Record<string, number> = {};
  for (let r = 1; r <= Math.min(10, ws.rowCount); r++) {
    const fila = ws.getRow(r);
    const tmp: Record<string, number> = {};
    fila.eachCell((c, col) => { tmp[normalizar(texto(c.value))] = col; });
    if (tmp.cedula && tmp.nombres) { Object.assign(mapa, tmp); filaEnc = r; break; }
  }
  if (!mapa.cedula) throw new Error('No se encontró la columna "Cédula". Usa la plantilla.');

  const filas: FilaImportada[] = [];
  for (let r = filaEnc + 1; r <= ws.rowCount; r++) {
    const fila = ws.getRow(r);
    const val = (k: string) => (mapa[k] ? texto(fila.getCell(mapa[k]).value).trim() : '');
    let cedula = val('cedula').replace(/\D/g, '');
    if (!cedula) continue;
    if (cedula.length === 9) cedula = `0${cedula}`; // Excel elimina el 0 inicial
    const sexo = val('sexo').toUpperCase()[0];
    filas.push({
      cedula,
      nombres: val('nombres'),
      apellidos: val('apellidos'),
      sexo: sexo === 'M' || sexo === 'F' ? sexo : null,
      area: val('area'),
      autoridad: /^(si|sí|s|x|1|true)$/i.test(val('maximaautoridad') || val('autoridad')),
    });
  }
  return filas;
}

export async function descargarPlantilla() {
  await exportarExcel('plantilla_colaboradores_fundametz.xlsx', [{
    nombre: 'Colaboradores',
    columnas: [
      { titulo: 'Cédula', valor: (f: string[]) => f[0], ancho: 14 },
      { titulo: 'Nombres', valor: (f: string[]) => f[1], ancho: 22 },
      { titulo: 'Apellidos', valor: (f: string[]) => f[2], ancho: 22 },
      { titulo: 'Sexo', valor: (f: string[]) => f[3], ancho: 8 },
      { titulo: 'Área', valor: (f: string[]) => f[4], ancho: 30 },
      { titulo: 'Máxima autoridad', valor: (f: string[]) => f[5], ancho: 16 },
    ],
    filas: [['0912345678', 'Nombre Ejemplo', 'Apellido Ejemplo', 'M', 'REFINACION', 'NO']],
  }]);
}
