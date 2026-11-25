// Pestaña de administración: bitácora de auditoría (LOPDP)
import { useMemo, useState } from 'react';
import { useExtras } from '../../lib/extras';
import { Encabezado, Tarjeta, campo } from './ui';

export const DESCRIPCION_ACCION: Record<string, string> = {
  'sesion.inicio': 'Inició sesión',
  'sesion.bloqueo_intentos': 'Bloqueo por intentos fallidos',
  'clave.cambiada': 'Cambió su contraseña',
  'consentimiento.aceptado': 'Aceptó el aviso de privacidad',
  'usuario.creado': 'Creó una cuenta',
  'usuario.editado': 'Editó una cuenta',
  'usuario.eliminado': 'Eliminó una cuenta',
  'usuario.activado': 'Activó una cuenta',
  'usuario.desactivado': 'Desactivó una cuenta',
  'usuario.clave_restablecida': 'Restableció una contraseña',
  'usuario.importacion': 'Importó colaboradores desde Excel',
  'certificado.emitido': 'Se emitió un certificado',
  'reporte.mdt_exportado': 'Exportó el Excel de evidencias MDT',
  'presencial.creada': 'Registró una sesión presencial',
  'presencial.asistencia': 'Registró asistencia presencial',
  'presencial.eliminada': 'Eliminó una sesión presencial',
  'curso.igualdad_cargado': 'Cargó el curso de Igualdad 2026',
  'configuracion.plan': 'Cambió la configuración del plan',
  'actividad.enviada': 'Envió una actividad práctica',
  'actividad.revisada': 'Revisó una actividad práctica',
  'usuario.cambio_clave_habilitado': 'Habilitó que un colaborador cree su nueva clave',
  'usuario.clave_creada': 'Creó su nueva contraseña tras el restablecimiento',
  'usuario.solicitud_clave': 'Pidió una clave nueva (olvidó su contraseña)',
  'usuario.solicitud_clave_descartada': 'Descartó un pedido de clave nueva',
  'cuenta.solicitada': 'Solicitó una cuenta desde la pantalla de inicio',
  'cuenta.aprobada': 'Aprobó una solicitud de cuenta',
  'cuenta.rechazada': 'Rechazó una solicitud de cuenta',
  'tour.completado': 'Completó el recorrido guiado',
};

export default function Auditoria() {
  const { auditoria } = useExtras();
  const [filtro, setFiltro] = useState('');
  const [q, setQ] = useState('');
  const acciones = useMemo(() => [...new Set(auditoria.map((a) => a.accion))].sort(), [auditoria]);
  const lista = auditoria
    .filter((a) => (!filtro || a.accion === filtro) && (!q || `${a.userName} ${a.detalle}`.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 1000);

  return (
    <div>
      <Encabezado titulo="Bitácora de auditoría" subtitulo="Registro de accesos, cambios de cuentas, exportaciones y certificados (LOPDP). No se puede editar ni borrar." />
      <div className="flex flex-wrap gap-2 mb-3">
        <input className={`${campo} w-64`} placeholder="Buscar por usuario o detalle" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${campo} w-auto`} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todas las acciones</option>
          {acciones.map((a) => <option key={a} value={a}>{DESCRIPCION_ACCION[a] ?? a}</option>)}
        </select>
      </div>
      <Tarjeta className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[680px]">
          <thead><tr className="bg-[#F8FAFC] text-[10px] uppercase tracking-wide text-[#64748B] border-b border-[#E0E0E0]">
            <th className="py-2.5 px-4">Fecha y hora</th><th className="px-3">Usuario</th><th className="px-3">Acción</th><th className="px-3">Detalle</th>
          </tr></thead>
          <tbody className="divide-y divide-[#F0F2F5]">
            {lista.map((a) => (
              <tr key={a.id}>
                <td className="py-2 px-4 whitespace-nowrap font-mono text-[11px]">{new Date(a.at).toLocaleString('es-EC')}</td>
                <td className="px-3 font-semibold text-[#0F172A]">{a.userName}</td>
                <td className="px-3">{DESCRIPCION_ACCION[a.accion] ?? a.accion}</td>
                <td className="px-3 text-[#64748B]">{a.detalle}</td>
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-[#64748B]">Sin registros.</td></tr>}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
