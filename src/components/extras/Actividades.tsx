// Administración: editor de actividades prácticas (en el formulario del curso) y revisión de respuestas
import { useMemo, useState } from 'react';
import { ClipboardList, Plus, Save, Trash2 } from 'lucide-react';
import type { ActividadPractica, RespuestaActividad, Topic, User } from '../../types';
import { useExtras } from '../../lib/extras';
import { Boton, Encabezado, Modal, Tarjeta, campo, etiqueta } from './ui';

const inputAdmin = 'w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-900 text-xs focus:border-indigo-500 outline-none';

/** Editor compacto para el modal de curso del administrador. */
export function EditorActividades({ value, onChange }: { value: ActividadPractica[]; onChange: (v: ActividadPractica[]) => void }) {
  const total = value.reduce((s, a) => s + (Number(a.puntos) || 0), 0);
  const set = (i: number, campoAct: keyof ActividadPractica, v: string | number) =>
    onChange(value.map((a, j) => (j === i ? { ...a, [campoAct]: v } : a)));
  return (
    <div className="space-y-2.5">
      {value.map((a, i) => (
        <div key={a.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex gap-2">
            <input className={inputAdmin} placeholder={`Título de la actividad ${i + 1}`} value={a.titulo} onChange={(e) => set(i, 'titulo', e.target.value)} />
            <input type="number" min={1} max={100} className={`${inputAdmin} w-20`} title="Puntos" value={a.puntos} onChange={(e) => set(i, 'puntos', Number(e.target.value))} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" aria-label="Quitar actividad"><Trash2 className="h-4 w-4" /></button>
          </div>
          <textarea className={inputAdmin} rows={3} placeholder="Consigna: caso o pregunta a resolver por escrito" value={a.consigna} onChange={(e) => set(i, 'consigna', e.target.value)} />
          <input className={inputAdmin} placeholder="Criterios de evaluación (opcional)" value={a.criterios} onChange={(e) => set(i, 'criterios', e.target.value)} />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => onChange([...value, { id: `act-${Date.now()}`, titulo: '', consigna: '', criterios: '', puntos: 20 }])}
          className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-indigo-600 hover:text-indigo-800">
          <Plus className="h-3.5 w-3.5" />Agregar actividad
        </button>
        {value.length > 0 && <span className={`text-[10px] font-mono ${total >= 100 ? 'text-rose-600' : 'text-slate-500'}`}>Actividades: {total} pts · Prueba final: {Math.max(0, 100 - total)} pts</span>}
      </div>
    </div>
  );
}

/** Pestaña de administración: respuestas de las actividades con ajuste de puntaje. */
export default function RevisionActividades({ currentUser, topics, users }: { currentUser: User; topics: Topic[]; users: User[] }) {
  const { respuestas, guardarRespuesta, registrarAuditoria } = useExtras();
  const cursos = topics.filter((t) => (t.actividades ?? []).length > 0);
  const [cursoId, setCursoId] = useState(cursos[0]?.id ?? '');
  const [q, setQ] = useState('');
  const [revisando, setRevisando] = useState<RespuestaActividad | null>(null);
  const curso = cursos.find((t) => t.id === cursoId);

  const lista = useMemo(() => respuestas
    .filter((r) => r.topicId === cursoId && (!q || r.userName.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.actualizadoAt.localeCompare(a.actualizadoAt)), [respuestas, cursoId, q]);

  const obligados = users.filter((u) => u.isActive && (u.role === 'user' || u.esAutoridad));
  const pendientes = curso ? obligados.filter((u) => !(curso.actividades ?? []).every((a) => respuestas.some((r) => r.userId === u.id && r.actividadId === a.id))).length : 0;

  return (
    <div>
      <Encabezado titulo="Actividades prácticas" subtitulo="Respuestas escritas de los colaboradores. Se acreditan al enviarse; puede revisarlas, ajustar el puntaje y dejar un comentario." />
      {cursos.length === 0 ? (
        <Tarjeta className="p-6 text-sm text-[#64748B]">Ningún curso tiene actividades prácticas. Agréguelas en "Temas y Contenido" → editar curso → "Actividades prácticas".</Tarjeta>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <select className={`${campo} w-auto max-w-md`} value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
              {cursos.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <input className={`${campo} w-56`} placeholder="Buscar colaborador" value={q} onChange={(e) => setQ(e.target.value)} />
            <span className="self-center text-xs text-[#64748B]">{lista.length} respuestas · {pendientes} personas con actividades pendientes</span>
          </div>
          <Tarjeta className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead><tr className="bg-[#F8FAFC] text-[10px] uppercase tracking-wide text-[#64748B] border-b border-[#E0E0E0]">
                <th className="py-2.5 px-4">Colaborador</th><th className="px-3">Actividad</th><th className="px-3 w-[40%]">Respuesta</th><th className="px-3">Puntos</th><th className="px-3">Fecha</th><th className="px-3" />
              </tr></thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {lista.map((r) => {
                  const act = curso?.actividades?.find((a) => a.id === r.actividadId);
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="py-2.5 px-4 font-semibold text-[#0F172A]">{r.userName}</td>
                      <td className="px-3 py-2.5">{act?.titulo ?? '—'}</td>
                      <td className="px-3 py-2.5 text-[#64748B]"><p className="line-clamp-3">{r.respuesta}</p></td>
                      <td className="px-3 py-2.5 font-bold">{r.puntos} / {act?.puntos ?? '?'}{r.revisadoPor && <span className="block text-[10px] font-normal text-[#00740f]">Revisada</span>}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{new Date(r.actualizadoAt).toLocaleDateString('es-EC')}</td>
                      <td className="px-3 py-2.5"><Boton variante="secundario" onClick={() => setRevisando(r)}>Revisar</Boton></td>
                    </tr>
                  );
                })}
                {lista.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[#64748B]">Aún no hay respuestas en este curso.</td></tr>}
              </tbody>
            </table>
          </Tarjeta>
        </>
      )}
      {revisando && curso && (
        <Revision respuesta={revisando} maximo={curso.actividades?.find((a) => a.id === revisando.actividadId)?.puntos ?? 20}
          consigna={curso.actividades?.find((a) => a.id === revisando.actividadId)?.consigna ?? ''}
          onCerrar={() => setRevisando(null)}
          onGuardar={(puntos, comentario) => {
            guardarRespuesta({ ...revisando, puntos, comentarioRevision: comentario || undefined, revisadoPor: currentUser.name });
            registrarAuditoria(currentUser, 'actividad.revisada', `${revisando.userName}: ${puntos} pts`);
            setRevisando(null);
          }} />
      )}
    </div>
  );
}

function Revision({ respuesta, maximo, consigna, onCerrar, onGuardar }:
  { respuesta: RespuestaActividad; maximo: number; consigna: string; onCerrar: () => void; onGuardar: (p: number, c: string) => void }) {
  const [puntos, setPuntos] = useState(respuesta.puntos);
  const [comentario, setComentario] = useState(respuesta.comentarioRevision ?? '');
  return (
    <Modal titulo={`Revisar respuesta · ${respuesta.userName}`} onCerrar={onCerrar} ancho="max-w-2xl" icono={<ClipboardList className="h-5 w-5 text-[#3B82F6]" />}>
      <p className="text-xs text-[#64748B] mb-2"><strong>Consigna:</strong> {consigna}</p>
      <div className="p-3 rounded bg-[#F8FAFC] border border-[#E0E0E0] text-sm whitespace-pre-line mb-4">{respuesta.respuesta}</div>
      <div className="grid sm:grid-cols-[140px_1fr] gap-3">
        <div><label className={etiqueta}>Puntos (máx. {maximo})</label><input type="number" min={0} max={maximo} className={campo} value={puntos} onChange={(e) => setPuntos(Math.max(0, Math.min(maximo, Number(e.target.value))))} /></div>
        <div><label className={etiqueta}>Comentario para el colaborador (opcional)</label><input className={campo} value={comentario} onChange={(e) => setComentario(e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-2 mt-4"><Boton variante="fantasma" onClick={onCerrar}>Cancelar</Boton><Boton onClick={() => onGuardar(puntos, comentario)}><Save className="h-4 w-4" />Guardar revisión</Boton></div>
    </Modal>
  );
}
