// Pestaña de administración: sesiones presenciales con registro de asistencia (suman horas al plan)
import { useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { CORPORATE_AREAS, EJES_MDT, type EjeMdt, type SesionPresencial, type User } from '../../types';
import { useExtras } from '../../lib/extras';
import { fmtHoras } from '../../lib/cumplimiento';
import { personasObligadas } from './PanelCumplimiento';
import { Aviso, Boton, Encabezado, Modal, Tarjeta, campo, etiqueta } from './ui';

export default function Presenciales({ currentUser, users, notificar }:
  { currentUser: User; users: User[]; notificar: (t: 'success' | 'error', m: string) => void }) {
  const { sesiones, guardarSesion, eliminarSesion, registrarAuditoria, config } = useExtras();
  const [nueva, setNueva] = useState(false);
  const [asistencia, setAsistencia] = useState<SesionPresencial | null>(null);
  const lista = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const delAnio = lista.filter((s) => s.fecha.startsWith(String(config.anio)));

  const [porEliminar, setPorEliminar] = useState<string | null>(null);
  const eliminar = (s: SesionPresencial) => {
    // Doble toque para confirmar (funciona también donde el navegador bloquea confirm()).
    if (porEliminar !== s.id) { setPorEliminar(s.id); window.setTimeout(() => setPorEliminar((x) => (x === s.id ? null : x)), 4000); return; }
    setPorEliminar(null);
    eliminarSesion(s.id);
    registrarAuditoria(currentUser, 'presencial.eliminada', s.tema);
    notificar('success', 'Sesión eliminada.');
  };

  return (
    <div>
      <Encabezado titulo="Capacitaciones presenciales"
        subtitulo={`Charlas y talleres con registro de asistencia. Suman horas al plan ${config.anio} de cada asistente. ${delAnio.length} sesiones · ${fmtHoras(delAnio.reduce((s, x) => s + x.horas, 0))} este año.`}
        acciones={<Boton onClick={() => setNueva(true)}><Plus className="h-4 w-4" />Nueva sesión</Boton>} />
      {lista.length === 0 && <Aviso>Aún no hay sesiones presenciales registradas.</Aviso>}
      <div className="grid md:grid-cols-2 gap-3">
        {lista.map((s) => (
          <Tarjeta key={s.id} className="p-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#2563EB]/10 text-[#2563EB]">{EJES_MDT[s.eje]}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#F0F2F5] text-[#0F172A]">{fmtHoras(s.horas)}</span>
            </div>
            <h3 className="font-bold text-[#0F172A]">{s.tema}</h3>
            <div className="mt-1.5 text-xs text-[#64748B] space-y-0.5">
              <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(`${s.fecha}T12:00:00`).toLocaleDateString('es-EC', { dateStyle: 'long' })}</p>
              {s.lugar && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{s.lugar}</p>}
              {s.facilitador && <p>Facilitador(a): {s.facilitador}</p>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">{s.asistentes.length} asistentes</span>
              <div className="flex gap-1.5">
                <button onClick={() => eliminar(s)} className={`p-2 rounded-lg text-[#D92D20] ${porEliminar === s.id ? 'bg-red-600 text-white px-3 text-xs font-semibold' : 'hover:bg-red-50'}`} aria-label="Eliminar">{porEliminar === s.id ? '¿Eliminar? Toca otra vez' : <Trash2 className="h-4 w-4" />}</button>
                <Boton variante="secundario" onClick={() => setAsistencia(s)}><UserCheck className="h-4 w-4" />Asistencia</Boton>
              </div>
            </div>
          </Tarjeta>
        ))}
      </div>

      {nueva && <NuevaSesion currentUser={currentUser} onCerrar={() => setNueva(false)} onCreada={(s) => {
        guardarSesion(s); registrarAuditoria(currentUser, 'presencial.creada', `${s.tema} · ${s.horas} h`);
        setNueva(false); setAsistencia(s);
      }} />}
      {asistencia && <Asistencia sesion={asistencia} users={personasObligadas(users)} onCerrar={() => setAsistencia(null)} onGuardar={(s) => {
        guardarSesion(s); registrarAuditoria(currentUser, 'presencial.asistencia', `${s.tema}: ${s.asistentes.length} asistentes`);
        setAsistencia(null); notificar('success', 'Asistencia guardada.');
      }} />}
    </div>
  );
}

function NuevaSesion({ currentUser, onCerrar, onCreada }: { currentUser: User; onCerrar: () => void; onCreada: (s: SesionPresencial) => void }) {
  const [f, setF] = useState({ tema: '', eje: 'violencia' as EjeMdt, fecha: new Date().toLocaleDateString('en-CA'), horas: '2', facilitador: '', lugar: '' });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onCreada({ id: `ses-${Date.now()}`, ...f, horas: Number(f.horas), asistentes: [], creadoPor: currentUser.id, creadoAt: new Date().toISOString() });
  };
  return (
    <Modal titulo="Nueva sesión presencial" onCerrar={onCerrar}>
      <form onSubmit={enviar} className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className={etiqueta}>Tema</label><input className={campo} required value={f.tema} onChange={(e) => setF({ ...f, tema: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className={etiqueta}>Eje del Acuerdo MDT-2025-006</label>
          <select className={campo} value={f.eje} onChange={(e) => setF({ ...f, eje: e.target.value as EjeMdt })}>{Object.entries(EJES_MDT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className={etiqueta}>Fecha</label><input type="date" className={campo} required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></div>
        <div><label className={etiqueta}>Duración (horas)</label><input type="number" min={0.5} step={0.5} className={campo} required value={f.horas} onChange={(e) => setF({ ...f, horas: e.target.value })} /></div>
        <div><label className={etiqueta}>Facilitador(a)</label><input className={campo} value={f.facilitador} onChange={(e) => setF({ ...f, facilitador: e.target.value })} /></div>
        <div><label className={etiqueta}>Lugar</label><input className={campo} value={f.lugar} onChange={(e) => setF({ ...f, lugar: e.target.value })} /></div>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-1"><Boton type="button" variante="fantasma" onClick={onCerrar}>Cancelar</Boton><Boton type="submit">Crear y registrar asistencia</Boton></div>
      </form>
    </Modal>
  );
}

function Asistencia({ sesion, users, onCerrar, onGuardar }: { sesion: SesionPresencial; users: User[]; onCerrar: () => void; onGuardar: (s: SesionPresencial) => void }) {
  const [marcados, setMarcados] = useState(new Set(sesion.asistentes));
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const visibles = useMemo(() => users.filter((u) => (!area || u.area === area) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => a.name.localeCompare(b.name)), [users, q, area]);
  const alternar = (id: string) => { const s = new Set(marcados); if (s.has(id)) s.delete(id); else s.add(id); setMarcados(s); };
  const marcarVisibles = (v: boolean) => { const s = new Set(marcados); visibles.forEach((u) => (v ? s.add(u.id) : s.delete(u.id))); setMarcados(s); };

  return (
    <Modal titulo={`Asistencia: ${sesion.tema}`} onCerrar={onCerrar} ancho="max-w-2xl" icono={<UserCheck className="h-5 w-5 text-[#3B82F6]" />}>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-44"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input className={`${campo} pl-8`} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className={`${campo} w-auto`} value={area} onChange={(e) => setArea(e.target.value)}><option value="">Todas las áreas</option>{CORPORATE_AREAS.map((a) => <option key={a}>{a}</option>)}</select>
        <Boton variante="secundario" onClick={() => marcarVisibles(true)}>Marcar visibles</Boton>
        <Boton variante="fantasma" onClick={() => marcarVisibles(false)}>Desmarcar</Boton>
      </div>
      <p className="text-xs font-semibold text-[#0F172A] mb-2">{marcados.size} asistentes · {fmtHoras(sesion.horas)} para cada uno</p>
      <ul className="max-h-[45vh] overflow-y-auto border border-[#E0E0E0] rounded-lg divide-y divide-[#F0F2F5]">
        {visibles.map((u) => (
          <li key={u.id}><label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#F8FAFC] text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[#2563EB]" checked={marcados.has(u.id)} onChange={() => alternar(u.id)} />
            <span className="flex-1 font-medium text-[#0F172A]">{u.name}</span><span className="text-[11px] text-[#64748B]">{u.area}</span>
          </label></li>
        ))}
        {visibles.length === 0 && <li className="p-4 text-center text-xs text-[#64748B]">Sin resultados.</li>}
      </ul>
      <div className="flex justify-end gap-2 mt-4"><Boton variante="fantasma" onClick={onCerrar}>Cancelar</Boton><Boton onClick={() => onGuardar({ ...sesion, asistentes: [...marcados] })}>Guardar asistencia</Boton></div>
    </Modal>
  );
}
