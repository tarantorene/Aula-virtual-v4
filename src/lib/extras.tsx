// ============================================================================
// CAPA DE DATOS DE LAS EXTENSIONES (cumplimiento MDT, LOPDP, auditoría)
// Guarda en Supabase cuando está configurado y siempre deja copia local,
// igual que el resto del Aula Virtual.
// Tablas: tiempo_estudio, sesiones_presenciales, certificados_emitidos,
//         auditoria, configuracion  (ver supabase_extension_mdt.sql)
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type { CertificadoEmitido, ConfigCumplimiento, RegistroAuditoria, RespuestaActividad, SesionPresencial, TiempoEstudio, User } from '../types';

const LS = {
  tiempos: 'academia_ext_tiempos',
  sesiones: 'academia_ext_sesiones',
  certificados: 'academia_ext_certificados',
  auditoria: 'academia_ext_auditoria',
  config: 'academia_ext_config',
  respuestas: 'academia_ext_respuestas',
};

export const CONFIG_INICIAL: ConfigCumplimiento = {
  anio: new Date().getFullYear(),
  horasMinimas: 40,
  nombrePlan: `Plan de Capacitación en Igualdad ${new Date().getFullYear()}`,
};

function leer<T>(clave: string, defecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : defecto;
  } catch {
    return defecto;
  }
}
function escribir(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* cuota llena */ }
}

export const hoyEcuador = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------- mapeos DB
const tiempoDesdeDB = (r: any): TiempoEstudio => ({
  id: r.id, userId: r.user_id, topicId: r.topic_id, materialId: r.material_id, fecha: r.fecha,
  segundos: Number(r.segundos), primerRegistro: r.primer_registro, ultimoRegistro: r.ultimo_registro,
});
const tiempoADB = (t: TiempoEstudio) => ({
  id: t.id, user_id: t.userId, topic_id: t.topicId, material_id: t.materialId, fecha: t.fecha,
  segundos: t.segundos, primer_registro: t.primerRegistro, ultimo_registro: t.ultimoRegistro,
});
const sesionDesdeDB = (r: any): SesionPresencial => ({
  id: r.id, tema: r.tema, eje: r.eje, fecha: r.fecha, horas: Number(r.horas), facilitador: r.facilitador ?? '',
  lugar: r.lugar ?? '', asistentes: r.asistentes ?? [], creadoPor: r.creado_por ?? '', creadoAt: r.creado_at,
});
const sesionADB = (s: SesionPresencial) => ({
  id: s.id, tema: s.tema, eje: s.eje, fecha: s.fecha, horas: s.horas, facilitador: s.facilitador, lugar: s.lugar,
  asistentes: s.asistentes, creado_por: s.creadoPor, creado_at: s.creadoAt,
});
const certDesdeDB = (r: any): CertificadoEmitido => ({
  codigo: r.codigo, userId: r.user_id, userName: r.user_name, cedula: r.cedula, topicId: r.topic_id,
  titulo: r.titulo, horas: Number(r.horas), emitidoAt: r.emitido_at,
});
const certADB = (c: CertificadoEmitido) => ({
  codigo: c.codigo, user_id: c.userId, user_name: c.userName, cedula: c.cedula, topic_id: c.topicId,
  titulo: c.titulo, horas: c.horas, emitido_at: c.emitidoAt,
});
const audDesdeDB = (r: any): RegistroAuditoria => ({
  id: r.id, userId: r.user_id, userName: r.user_name, accion: r.accion, detalle: r.detalle ?? '', at: r.at,
});
const respDesdeDB = (r: any): RespuestaActividad => ({
  id: r.id, userId: r.user_id, userName: r.user_name, topicId: r.topic_id, actividadId: r.actividad_id,
  respuesta: r.respuesta, puntos: Number(r.puntos), revisadoPor: r.revisado_por ?? undefined,
  comentarioRevision: r.comentario_revision ?? undefined, actualizadoAt: r.actualizado_at,
});
const respADB = (r: RespuestaActividad) => ({
  id: r.id, user_id: r.userId, user_name: r.userName, topic_id: r.topicId, actividad_id: r.actividadId,
  respuesta: r.respuesta, puntos: r.puntos, revisado_por: r.revisadoPor ?? null,
  comentario_revision: r.comentarioRevision ?? null, actualizado_at: r.actualizadoAt,
});
const audADB = (a: RegistroAuditoria) => ({ id: a.id, user_id: a.userId, user_name: a.userName, accion: a.accion, detalle: a.detalle, at: a.at });

// ---------------------------------------------------------------- contexto
interface ExtrasCtx {
  tiempos: TiempoEstudio[];
  sesiones: SesionPresencial[];
  certificados: CertificadoEmitido[];
  auditoria: RegistroAuditoria[];
  config: ConfigCumplimiento;
  modo: 'local' | 'supabase';
  avisoBD: string | null;
  registrarTiempo: (userId: string, topicId: string, materialId: string, segundos: number) => number;
  guardarSesion: (s: SesionPresencial) => void;
  eliminarSesion: (id: string) => void;
  emitirCertificado: (datos: Omit<CertificadoEmitido, 'codigo' | 'emitidoAt'>) => CertificadoEmitido;
  registrarAuditoria: (usuario: Pick<User, 'id' | 'name'> | null, accion: string, detalle?: string) => void;
  guardarConfig: (c: ConfigCumplimiento) => void;
  respuestas: RespuestaActividad[];
  guardarRespuesta: (r: RespuestaActividad) => void;
}

const Ctx = createContext<ExtrasCtx | null>(null);

export function ExtrasProvider({ children }: { children: ReactNode }) {
  const [tiempos, setTiempos] = useState<TiempoEstudio[]>(() => leer(LS.tiempos, []));
  const [sesiones, setSesiones] = useState<SesionPresencial[]>(() => leer(LS.sesiones, []));
  const [certificados, setCertificados] = useState<CertificadoEmitido[]>(() => leer(LS.certificados, []));
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>(() => leer(LS.auditoria, []));
  const [config, setConfig] = useState<ConfigCumplimiento>(() => leer(LS.config, CONFIG_INICIAL));
  const [respuestas, setRespuestas] = useState<RespuestaActividad[]>(() => leer(LS.respuestas, []));
  const [modo, setModo] = useState<'local' | 'supabase'>('local');
  const [avisoBD, setAvisoBD] = useState<string | null>(null);
  const ultimoLatido = useRef<Record<string, number>>({});

  useEffect(() => escribir(LS.tiempos, tiempos), [tiempos]);
  useEffect(() => escribir(LS.sesiones, sesiones), [sesiones]);
  useEffect(() => escribir(LS.certificados, certificados), [certificados]);
  useEffect(() => escribir(LS.auditoria, auditoria.slice(0, 3000)), [auditoria]);
  useEffect(() => escribir(LS.config, config), [config]);
  useEffect(() => escribir(LS.respuestas, respuestas), [respuestas]);

  // Carga inicial desde Supabase
  useEffect(() => {
    (async () => {
      const sb = getSupabaseClient();
      if (!sb || !isSupabaseConfigured()) return;
      try {
        const traer = async (tabla: string, orden?: string) => {
          const filas: any[] = [];
          for (let desde = 0; ; desde += 1000) {
            let q = sb.from(tabla).select('*').range(desde, desde + 999);
            if (orden) q = q.order(orden, { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            filas.push(...(data ?? []));
            if (!data || data.length < 1000) break;
          }
          return filas;
        };
        const [t, s, c, a, cfg] = await Promise.all([
          traer('tiempo_estudio'), traer('sesiones_presenciales'), traer('certificados_emitidos'),
          traer('auditoria', 'at'), traer('configuracion'),
        ]);
        // Respuestas de actividades (tabla agregada después: si no existe, se mantiene lo local)
        traer('respuestas_actividades').then((r) => setRespuestas(r.map(respDesdeDB))).catch(() => undefined);
        setTiempos(t.map(tiempoDesdeDB));
        setSesiones(s.map(sesionDesdeDB));
        setCertificados(c.map(certDesdeDB));
        setAuditoria(a.map(audDesdeDB));
        const filaCfg = cfg.find((x) => x.clave === 'cumplimiento');
        if (filaCfg?.valor) setConfig({ ...CONFIG_INICIAL, ...filaCfg.valor });
        setModo('supabase');
        setAvisoBD(null);
      } catch (e: any) {
        console.warn('Extensiones MDT: tablas no disponibles en Supabase, se usa almacenamiento local.', e?.message);
        setAvisoBD('Las tablas de cumplimiento no existen en Supabase. Ejecuta el archivo supabase_extension_mdt.sql; mientras tanto los datos se guardan solo en este navegador.');
      }
    })();
  }, []);

  const subir = useCallback((tabla: string, fila: object, conflicto?: string) => {
    const sb = getSupabaseClient();
    if (!sb || modo !== 'supabase') return;
    sb.from(tabla).upsert(fila, conflicto ? { onConflict: conflicto } : undefined)
      .then(({ error }) => { if (error) console.warn(`Error al guardar en ${tabla}:`, error.message); });
  }, [modo]);

  const borrar = useCallback((tabla: string, columna: string, valor: string) => {
    const sb = getSupabaseClient();
    if (!sb || modo !== 'supabase') return;
    sb.from(tabla).delete().eq(columna, valor).then(({ error }) => { if (error) console.warn(`Error al borrar en ${tabla}:`, error.message); });
  }, [modo]);

  /**
   * Suma tiempo efectivo. Reglas anti-inflado: máximo 75 s por registro y
   * mínimo 45 s entre registros del mismo usuario (aunque tenga varias pestañas).
   * Devuelve los segundos realmente sumados.
   */
  const registrarTiempo = useCallback((userId: string, topicId: string, materialId: string, segundos: number) => {
    const ahora = Date.now();
    if (ahora - (ultimoLatido.current[userId] ?? 0) < 45_000) return 0;
    ultimoLatido.current[userId] = ahora;
    const suma = Math.max(0, Math.min(75, Math.round(segundos)));
    const fecha = hoyEcuador();
    const id = `${userId}|${materialId}|${fecha}`;
    const iso = new Date(ahora).toISOString();
    setTiempos((prev) => {
      const actual = prev.find((t) => t.id === id);
      const nuevo: TiempoEstudio = actual
        ? { ...actual, segundos: actual.segundos + suma, ultimoRegistro: iso }
        : { id, userId, topicId, materialId, fecha, segundos: suma, primerRegistro: iso, ultimoRegistro: iso };
      subir('tiempo_estudio', tiempoADB(nuevo), 'id');
      return actual ? prev.map((t) => (t.id === id ? nuevo : t)) : [...prev, nuevo];
    });
    return suma;
  }, [subir]);

  const guardarSesion = useCallback((s: SesionPresencial) => {
    setSesiones((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [s, ...prev]));
    subir('sesiones_presenciales', sesionADB(s), 'id');
  }, [subir]);

  const eliminarSesion = useCallback((id: string) => {
    setSesiones((prev) => prev.filter((s) => s.id !== id));
    borrar('sesiones_presenciales', 'id', id);
  }, [borrar]);

  const certificadosRef = useRef(certificados);
  useEffect(() => { certificadosRef.current = certificados; }, [certificados]);

  const emitirCertificado = useCallback((d: Omit<CertificadoEmitido, 'codigo' | 'emitidoAt'>) => {
    const existente = certificadosRef.current.find((c) => c.userId === d.userId && c.topicId === d.topicId);
    if (existente) return existente;
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const codigo = `FZ-${new Date().getFullYear()}-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    const cert: CertificadoEmitido = { ...d, codigo, emitidoAt: new Date().toISOString() };
    certificadosRef.current = [...certificadosRef.current, cert];
    setCertificados((prev) => [...prev, cert]);
    subir('certificados_emitidos', certADB(cert), 'codigo');
    return cert;
  }, [subir]);

  const registrarAuditoria = useCallback((usuario: Pick<User, 'id' | 'name'> | null, accion: string, detalle = '') => {
    const r: RegistroAuditoria = { id: uid('aud'), userId: usuario?.id ?? 'sistema', userName: usuario?.name ?? 'Sistema', accion, detalle, at: new Date().toISOString() };
    setAuditoria((prev) => [r, ...prev]);
    subir('auditoria', audADB(r));
  }, [subir]);

  const guardarConfig = useCallback((c: ConfigCumplimiento) => {
    setConfig(c);
    subir('configuracion', { clave: 'cumplimiento', valor: c }, 'clave');
  }, [subir]);

  const guardarRespuesta = useCallback((r: RespuestaActividad) => {
    setRespuestas((prev) => (prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r]));
    subir('respuestas_actividades', respADB(r), 'id');
  }, [subir]);

  return (
    <Ctx.Provider value={{ tiempos, sesiones, certificados, auditoria, config, modo, avisoBD, registrarTiempo, guardarSesion, eliminarSesion, emitirCertificado, registrarAuditoria, guardarConfig, respuestas, guardarRespuesta }}>
      {children}
    </Ctx.Provider>
  );
}

export function useExtras() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useExtras debe usarse dentro de ExtrasProvider');
  return c;
}

/** Busca un certificado por código directamente en Supabase (para la verificación pública). */
export async function buscarCertificadoRemoto(codigo: string): Promise<CertificadoEmitido | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data } = await sb.from('certificados_emitidos').select('*').eq('codigo', codigo.trim().toUpperCase()).maybeSingle();
  return data ? certDesdeDB(data) : null;
}
