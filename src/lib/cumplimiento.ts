// Cálculo de horas acreditadas para el plan anual (Acuerdo MDT-2025-006)
import type { ConfigCumplimiento, RespuestaActividad, SesionPresencial, TiempoEstudio, Topic, User, UserProgress } from '../types';

/** Puntos de actividades del curso: total posible, obtenidos y respondidas. */
export function puntosActividades(topic: Topic, userId: string, respuestas: RespuestaActividad[]) {
  const acts = topic.actividades ?? [];
  const posibles = acts.reduce((s, a) => s + (a.puntos || 0), 0);
  const mias = respuestas.filter((r) => r.userId === userId && r.topicId === topic.id);
  const obtenidos = acts.reduce((s, a) => s + Math.min(a.puntos, mias.find((r) => r.actividadId === a.id)?.puntos ?? 0), 0);
  const respondidas = acts.filter((a) => mias.some((r) => r.actividadId === a.id && r.respuesta.trim())).length;
  return { posibles, obtenidos, respondidas, total: acts.length, completas: respondidas === acts.length };
}

/**
 * Nota del módulo sobre 100.
 * Con actividades: puntos de actividades + prueba final escalada al resto (p. ej. 40 + 60).
 * Sin actividades: la nota de la prueba (0-10) × 10.
 */
export function notaModulo(topic: Topic, userId: string, highestScore: number | null | undefined, respuestas: RespuestaActividad[]) {
  const pa = puntosActividades(topic, userId, respuestas);
  const pesoPrueba = Math.max(0, 100 - pa.posibles);
  const prueba = highestScore != null ? (highestScore / 10) * pesoPrueba : 0;
  const nota = Math.round((pa.obtenidos + prueba) * 10) / 10;
  const minima = pa.total > 0 ? (topic.notaMinimaModulo ?? 70) : topic.minScoreToPass * 10;
  return { ...pa, pesoPrueba, prueba: Math.round(prueba * 10) / 10, nota, minima, aprobada: nota >= minima && pa.completas };
}

export interface CursoAvance {
  topic: Topic;
  horas: number;
  segundos: number;
  minutosMinimos: number;
  aprobado: boolean;
  tiempoOk: boolean;
  acreditado: boolean;
  nota: number | null;
  notaModulo: number;
  actividadesCompletas: boolean;
}

export interface ResumenHoras {
  cursos: CursoAvance[];
  virtuales: number;
  presenciales: number;
  total: number;
  minimas: number;
  segundosEstudio: number;
  completo: boolean;
  estado: 'Completo' | 'En progreso' | 'Pendiente';
}

/** Cursos publicados visibles para el área del usuario (misma regla que el tablero del colaborador). */
export function cursosDelUsuario(user: User, topics: Topic[]) {
  return topics.filter((t) => {
    if (t.status !== 'published') return false;
    if (!t.targetAreas || t.targetAreas.length === 0) return true;
    return t.targetAreas.includes(user.area || 'ADMINISTRACION');
  });
}

export function resumenHoras(
  user: User, topics: Topic[], progress: UserProgress[], tiempos: TiempoEstudio[],
  sesiones: SesionPresencial[], config: ConfigCumplimiento, respuestas: RespuestaActividad[] = [],
): ResumenHoras {
  const mdt = cursosDelUsuario(user, topics).filter((t) => (t.horasAcreditadas ?? 0) > 0);
  const misTiempos = tiempos.filter((t) => t.userId === user.id);

  const cursos: CursoAvance[] = mdt.map((topic) => {
    const p = progress.find((x) => x.userId === user.id && x.topicId === topic.id);
    const segundos = misTiempos.filter((t) => t.topicId === topic.id).reduce((s, t) => s + t.segundos, 0);
    const minutosMinimos = topic.minutosMinimos ?? 0;
    const nm = notaModulo(topic, user.id, p?.highestScore, respuestas);
    // Con actividades, el módulo se aprueba por la nota compuesta; sin ellas, por la prueba final
    const aprobado = p?.quizStatus === 'passed' && (nm.total === 0 || nm.aprobada);
    const tiempoOk = segundos >= minutosMinimos * 60;
    return {
      topic, horas: topic.horasAcreditadas ?? 0, segundos, minutosMinimos,
      aprobado, tiempoOk, acreditado: aprobado && tiempoOk, nota: p?.highestScore ?? null,
      notaModulo: nm.nota, actividadesCompletas: nm.completas,
    };
  });

  const virtuales = cursos.filter((c) => c.acreditado).reduce((s, c) => s + c.horas, 0);
  const presenciales = sesiones
    .filter((s) => s.fecha.startsWith(String(config.anio)) && s.asistentes.includes(user.id))
    .reduce((s, x) => s + x.horas, 0);
  const total = virtuales + presenciales;
  const completo = total >= config.horasMinimas && cursos.every((c) => c.acreditado);
  const segundosEstudio = misTiempos.reduce((s, t) => s + t.segundos, 0);
  return {
    cursos, virtuales, presenciales, total, minimas: config.horasMinimas, segundosEstudio, completo,
    estado: completo ? 'Completo' : total > 0 || segundosEstudio > 0 ? 'En progreso' : 'Pendiente',
  };
}

export const fmtHoras = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
export const fmtMinutos = (seg: number) => {
  const m = Math.floor(seg / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};
