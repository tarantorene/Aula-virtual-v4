// Importación masiva desde Excel y entrega de claves temporales
import { useState } from 'react';
import { Copy, Download, FileUp, KeyRound } from 'lucide-react';
import { CORPORATE_AREAS, type User } from '../../types';
import { cedulaValida, claveTemporal, hashClave } from '../../lib/seguridad';
import { descargarPlantilla, exportarExcel, leerColaboradores, type FilaImportada } from '../../lib/excel';
import { Aviso, Boton, Modal } from './ui';

export interface Credencial { cedula: string; nombre: string; clave: string; telefono?: string }

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
const areaOficial = (a: string) => CORPORATE_AREAS.find((x) => normalizar(x) === normalizar(a) || normalizar(x).replace(/[^A-Z]/g, '') === normalizar(a).replace(/[^A-Z]/g, ''));

export function ImportarColaboradores({ users, onCerrar, onImportar }:
  { users: User[]; onCerrar: () => void; onImportar: (nuevos: User[], credenciales: Credencial[]) => void }) {
  const [filas, setFilas] = useState<(FilaImportada & { problema?: string; areaOk?: string })[]>([]);
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const leer = async (archivo?: File) => {
    if (!archivo) return;
    setError('');
    try {
      const datos = await leerColaboradores(archivo);
      const vistas = new Set<string>();
      setFilas(datos.map((d) => {
        let problema: string | undefined;
        if (!cedulaValida(d.cedula)) problema = 'Cédula no válida';
        else if (users.some((u) => u.email === d.cedula)) problema = 'Ya tiene cuenta';
        else if (vistas.has(d.cedula)) problema = 'Repetida en el archivo';
        else if (!d.nombres) problema = 'Falta el nombre';
        vistas.add(d.cedula);
        return { ...d, problema, areaOk: areaOficial(d.area) };
      }));
    } catch (e: any) { setError(e?.message ?? String(e)); }
  };

  const validas = filas.filter((f) => !f.problema);

  const crear = async () => {
    setCreando(true);
    const credenciales: Credencial[] = [];
    const nuevos: User[] = [];
    for (const [i, f] of validas.entries()) {
      const clave = claveTemporal();
      const nombre = `${f.nombres} ${f.apellidos}`.replace(/\s+/g, ' ').trim();
      nuevos.push({
        id: `usr-${Date.now()}-${i}`, name: nombre, email: f.cedula, role: 'user', passwordHash: await hashClave(clave),
        createdAt: new Date().toISOString(), isActive: true, area: f.areaOk ?? 'ADMINISTRACION',
        sexo: f.sexo ?? undefined, esAutoridad: f.autoridad, debeCambiarClave: true,
      });
      credenciales.push({ cedula: f.cedula, nombre, clave });
    }
    onImportar(nuevos, credenciales);
  };

  return (
    <Modal titulo="Importar colaboradores desde Excel" onCerrar={onCerrar} ancho="max-w-4xl" icono={<FileUp className="h-5 w-5 text-[#3B82F6]" />}>
      <ol className="text-xs text-[#64748B] space-y-1 mb-4">
        <li>1. Descargue la plantilla y complete una fila por persona: Cédula, Nombres, Apellidos, Sexo (M/F), Área y Máxima autoridad (SI/NO).</li>
        <li>2. El área debe coincidir con las áreas del sistema (por ejemplo REFINACION, CALIDAD, BATERIAS / BODEGA).</li>
        <li>3. Cada cuenta recibe una clave temporal; en su primer ingreso la persona crea su propia contraseña.</li>
      </ol>
      <div className="flex flex-wrap gap-2 mb-4">
        <Boton variante="secundario" onClick={descargarPlantilla}><Download className="h-4 w-4" />Descargar plantilla</Boton>
        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
          <FileUp className="h-4 w-4" />Elegir archivo .xlsx
          <input type="file" accept=".xlsx" className="hidden" onChange={(e) => leer(e.target.files?.[0])} />
        </label>
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {filas.length > 0 && (
        <>
          <p className="text-xs font-semibold text-[#0F172A] mb-2">{validas.length} filas listas · {filas.length - validas.length} con observaciones</p>
          <div className="max-h-72 overflow-auto border border-[#E0E0E0] rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] sticky top-0"><tr className="text-[10px] uppercase text-[#64748B]"><th className="p-2">Cédula</th><th className="p-2">Nombre</th><th className="p-2">Sexo</th><th className="p-2">Área</th><th className="p-2">Autoridad</th><th className="p-2">Revisión</th></tr></thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {filas.map((f, i) => (
                  <tr key={i}>
                    <td className="p-2 font-mono">{f.cedula}</td><td className="p-2">{f.nombres} {f.apellidos}</td><td className="p-2">{f.sexo ?? '—'}</td>
                    <td className="p-2">{f.areaOk ?? <span className="text-amber-700">{f.area || '—'} → ADMINISTRACION</span>}</td>
                    <td className="p-2">{f.autoridad ? 'Sí' : ''}</td>
                    <td className="p-2">{f.problema ? <span className="font-semibold text-[#D92D20]">{f.problema}</span> : <span className="text-[#00AC18] font-semibold">OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Boton variante="fantasma" onClick={onCerrar}>Cancelar</Boton>
            <Boton disabled={!validas.length} cargando={creando} onClick={crear}>Crear {validas.length} cuentas</Boton>
          </div>
        </>
      )}
    </Modal>
  );
}


export function CredencialesModal({ lista, onCerrar, restablecimiento = false }: { lista: Credencial[]; onCerrar: () => void; restablecimiento?: boolean }) {
  const exportar = () => exportarExcel(`claves_temporales_${new Date().toISOString().slice(0, 10)}.xlsx`, [{
    nombre: 'Claves temporales',
    titulo: 'Claves temporales · Aula Virtual Fundametz (entregar de forma personal y destruir después)',
    columnas: [
      { titulo: 'Cédula (usuario)', valor: (c: Credencial) => c.cedula, ancho: 16 },
      { titulo: 'Colaborador', valor: (c: Credencial) => c.nombre, ancho: 36 },
      { titulo: 'Clave temporal', valor: (c: Credencial) => c.clave, ancho: 18 },
      { titulo: 'Firma de recepción', valor: () => '', ancho: 28 },
    ],
    filas: lista,
  }]);
  return (
    <Modal titulo="Claves temporales generadas" onCerrar={onCerrar} ancho="max-w-xl" icono={<KeyRound className="h-5 w-5 text-[#3B82F6]" />}>
      {restablecimiento && (
        <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-900">
          <strong>La cuenta se conserva:</strong> el avance, las notas, el tiempo de estudio y los certificados siguen intactos. Solo cambió la clave.
        </div>
      )}
      <Aviso tipo="alerta">Se muestran <strong>una sola vez</strong> (el sistema solo guarda una versión cifrada). Entréguelas de forma personal; al ingresar, cada persona creará su propia contraseña.</Aviso>
      <ul className="mt-3 max-h-72 overflow-y-auto space-y-1.5">
        {lista.map((c) => (
          <li key={c.cedula} className="flex items-center justify-between gap-3 p-2.5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-lg">
            <div className="min-w-0"><p className="text-sm font-semibold text-[#0F172A] truncate">{c.nombre}</p><p className="text-[11px] text-[#64748B] font-mono">Usuario: {c.cedula}</p></div>
            <div className="flex items-center gap-1.5">
              <code className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded text-base font-bold tracking-wider text-[#1E3A8A]">{c.clave}</code>
              <button onClick={() => navigator.clipboard?.writeText(c.clave)} className="p-1.5 hover:bg-white rounded" title="Copiar"><Copy className="h-4 w-4 text-[#64748B]" /></button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2 mt-4">
        {lista.length > 1 && <Boton variante="secundario" onClick={exportar}><Download className="h-4 w-4" />Descargar listado para entrega</Boton>}
        <Boton onClick={onCerrar}>Listo</Boton>
      </div>
    </Modal>
  );
}
