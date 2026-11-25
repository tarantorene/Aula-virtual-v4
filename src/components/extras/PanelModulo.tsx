// Vista del colaborador: objetivo, planificación, nota del módulo (actividades + prueba) y actividades prácticas
import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Lock, PenLine, Target } from 'lucide-react';
import type { Topic, User } from '../../types';
import { useExtras } from '../../lib/extras';
import { notaModulo } from '../../lib/cumplimiento';
import { Aviso, Barra, Boton } from './ui';

export const MIN_CARACTERES_ACTIVIDAD = 120;

export default function PanelModulo({ topic, user, highestScore, bloqueado, lecturasListas = true }:
  { topic: Topic; user: User; highestScore: number | null; bloqueado: boolean; lecturasListas?: boolean }) {
  const { respuestas, guardarRespuesta, registrarAuditoria } = useExtras();
  const nm = notaModulo(topic, user.id, highestScore, respuestas);
  const acts = topic.actividades ?? [];
  const [abierto, setAbierto] = useState(acts.length > 0 && !nm.completas && lecturasListas);
  const horasEstudio = Math.max(0, Math.round(((topic.minutosMinimos ?? 0) / 60) * 10) / 10);

  if (acts.length === 0 && !topic.minutosMinimos && !topic.horasAcreditadas) return null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-md overflow-hidden" id="tour-panel-modulo">
      <div className="p-4 sm:p-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            <Target className="h-3.5 w-3.5" />Objetivo de aprendizaje{topic.horasAcreditadas ? ` · ${topic.horasAcreditadas} horas` : ''}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{topic.description}</p>
          {horasEstudio > 0 && (
            <p className="text-xs text-slate-500"><strong className="text-slate-700">Planificación sugerida:</strong> dedica al menos {horasEstudio} h a la lectura y estudio de los contenidos y ejemplos{acts.length ? ' antes de pasar a las actividades' : ''}.</p>
          )}
        </div>
        {(acts.length > 0) && (
          <div className="md:w-64 p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1.5">
            <p className="font-mono font-bold uppercase tracking-wider text-[10px] text-slate-500">Nota del módulo</p>
            <p className="text-2xl font-bold text-[#0F172A]">{nm.nota}<span className="text-sm text-slate-400"> / 100</span></p>
            <Barra valor={nm.nota} color={nm.aprobada ? 'bg-[#00AC18]' : 'bg-[#2563EB]'} />
            <div className="flex justify-between text-slate-600"><span>Actividades</span><span className="font-semibold">{nm.obtenidos} / {nm.posibles}</span></div>
            <div className="flex justify-between text-slate-600"><span>Prueba final</span><span className="font-semibold">{nm.prueba} / {nm.pesoPrueba}</span></div>
            <p className={`font-semibold ${nm.aprobada ? 'text-[#00740f]' : 'text-slate-500'}`}>{nm.aprobada ? '✓ Módulo aprobado' : `Mínimo para aprobar: ${nm.minima}`}</p>
          </div>
        )}
      </div>

      {acts.length > 0 && (
        <div className="border-t border-slate-100">
          <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-[#F8FAFC] hover:bg-slate-100 text-left">
            <span className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <ClipboardList className="h-4.5 w-4.5 text-[#2563EB]" />
              Actividades prácticas ({acts.length}) · {nm.posibles} pts
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${nm.completas ? 'bg-green-100 text-[#00740f]' : 'bg-amber-100 text-amber-800'}`}>{nm.respondidas}/{acts.length} enviadas</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {!abierto && !nm.completas && <span className="hidden sm:inline text-xs font-semibold text-[#2563EB]">{lecturasListas ? 'Responder ahora' : 'Recomendado al terminar las lecturas'}</span>}
              {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>
          {abierto && (
            <div className="p-4 sm:p-5 space-y-4">
              {bloqueado ? (
                <Aviso tipo="alerta"><Lock className="inline h-4 w-4 mr-1" />Primero termina de ver el <strong>video de la clase principal</strong> para desbloquear las actividades.</Aviso>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Escribe tu respuesta con tus propias palabras. Al enviarla se acreditan los puntos; puedes editarla después si deseas mejorarla. Recursos Humanos puede revisarla y ajustar el puntaje.</p>
                  {acts.map((a, i) => (
                    <Actividad key={a.id} n={i + 1} topic={topic} user={user} actividad={a}
                      guardada={respuestas.find((r) => r.userId === user.id && r.actividadId === a.id)}
                      onGuardar={(texto) => {
                        const existente = respuestas.find((r) => r.userId === user.id && r.actividadId === a.id);
                        guardarRespuesta({
                          id: `${user.id}|${a.id}`, userId: user.id, userName: user.name, topicId: topic.id, actividadId: a.id,
                          respuesta: texto,
                          // Si RRHH ya revisó y ajustó el puntaje, se mantiene; si no, se acredita completo
                          puntos: existente?.revisadoPor ? existente.puntos : a.puntos,
                          revisadoPor: existente?.revisadoPor, comentarioRevision: existente?.comentarioRevision,
                          actualizadoAt: new Date().toISOString(),
                        });
                        registrarAuditoria(user, 'actividad.enviada', `${topic.title} · ${a.titulo}`);
                      }} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Actividad({ n, actividad, guardada, onGuardar }: {
  key?: string;
  n: number; topic: Topic; user: User; actividad: NonNullable<Topic['actividades']>[number];
  guardada?: { respuesta: string; puntos: number; revisadoPor?: string; comentarioRevision?: string; actualizadoAt: string };
  onGuardar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState(guardada?.respuesta ?? '');
  const [editando, setEditando] = useState(!guardada);
  const faltan = MIN_CARACTERES_ACTIVIDAD - texto.trim().length;

  return (
    <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-bold text-[#0F172A]">Actividad {n}: {actividad.titulo}</h4>
        <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB]">{actividad.puntos} pts</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{actividad.consigna}</p>
      {actividad.criterios && <p className="text-xs text-slate-500"><strong>Criterios de evaluación:</strong> {actividad.criterios}</p>}
      {guardada && !editando ? (
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-slate-700 whitespace-pre-line">{guardada.respuesta}</div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1 font-semibold text-[#00740f]"><CheckCircle2 className="h-4 w-4" />Enviada · {guardada.puntos} de {actividad.puntos} pts{guardada.revisadoPor ? ' (revisada por RRHH)' : ''}</span>
            <Boton variante="secundario" onClick={() => setEditando(true)}><PenLine className="h-3.5 w-3.5" />Editar respuesta</Boton>
          </div>
          {guardada.comentarioRevision && <p className="text-xs p-2.5 rounded bg-blue-50 border border-blue-100 text-[#0b4f7c]"><strong>Comentario de Recursos Humanos:</strong> {guardada.comentarioRevision}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} placeholder="Escribe aquí tu respuesta…"
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-[11px] ${faltan > 0 ? 'text-slate-500' : 'text-[#00740f]'}`}>{faltan > 0 ? `Escribe al menos ${faltan} caracteres más` : '✓ Extensión suficiente'}</span>
            <div className="flex gap-2">
              {guardada && <Boton variante="fantasma" onClick={() => { setTexto(guardada.respuesta); setEditando(false); }}>Cancelar</Boton>}
              <Boton disabled={faltan > 0} onClick={() => { onGuardar(texto.trim()); setEditando(false); }}>Enviar y acreditar {actividad.puntos} pts</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
