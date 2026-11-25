// Pestaña de administración: cumplimiento del plan anual de 40 horas (Acuerdo MDT-2025-006)
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle, Award, BookOpenCheck, Clock, Download, FileSpreadsheet, Save, Search, Users, UserX } from 'lucide-react';
import type { Material, Question, QuizAttempt, Topic, User, UserProgress } from '../../types';
import { EJES_MDT } from '../../types';
import { useExtras } from '../../lib/extras';
import { fmtHoras, fmtMinutos, resumenHoras, type ResumenHoras } from '../../lib/cumplimiento';
import { exportarExcel } from '../../lib/excel';
import { cursoIgualdad2026 } from '../../lib/cursoIgualdad';
import { Aviso, Barra, Boton, Encabezado, Tarjeta, campo, etiqueta } from './ui';

interface Props {
  currentUser: User;
  users: User[];
  topics: Topic[];
  setTopics: Dispatch<SetStateAction<Topic[]>>;
  setMaterials: Dispatch<SetStateAction<Material[]>>;
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  progress: UserProgress[];
  attempts: QuizAttempt[];
  notificar: (tipo: 'success' | 'error', msg: string) => void;
}

type Fila = { user: User; r: ResumenHoras };
const ESTADO_COLOR: Record<string, string> = {
  Completo: 'bg-green-50 text-[#00740f] border-green-200',
  'En progreso': 'bg-amber-50 text-amber-800 border-amber-200',
  Pendiente: 'bg-slate-50 text-slate-500 border-slate-200',
};

/** Personas obligadas a la capacitación: colaboradores activos y máximas autoridades. */
export const personasObligadas = (users: User[]) => users.filter((u) => u.isActive && (u.role === 'user' || u.esAutoridad));

export default function PanelCumplimiento({ currentUser, users, topics, setTopics, setMaterials, setQuestions, progress, attempts, notificar }: Props) {
  const { tiempos, sesiones, config, guardarConfig, registrarAuditoria, avisoBD, respuestas } = useExtras();
  const [cfg, setCfg] = useState(config);
  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [exportando, setExportando] = useState(false);

  const filas: Fila[] = useMemo(() => personasObligadas(users)
    .map((user) => ({ user, r: resumenHoras(user, topics, progress, tiempos, sesiones, config, respuestas) }))
    .sort((a, b) => a.user.name.localeCompare(b.user.name)), [users, topics, progress, tiempos, sesiones, config, respuestas]);

  const cursosMdt = topics.filter((t) => (t.horasAcreditadas ?? 0) > 0);
  const horasVirtualesPlan = cursosMdt.filter((t) => t.status === 'published').reduce((s, t) => s + (t.horasAcreditadas ?? 0), 0);
  const ejesCubiertos = new Set(cursosMdt.map((t) => t.ejeMdt).filter(Boolean));
  const faltanEjes = (['derechos', 'genero', 'violencia', 'igual_valor'] as const).filter((e) => !ejesCubiertos.has(e) && !sesiones.some((s) => s.eje === e));
  const yaCargado = topics.some((t) => t.id.startsWith('tpc-igualdad-2026'));
  const sinActividades = yaCargado && topics.some((t) => t.id.startsWith('tpc-igualdad-2026') && !(t.actividades ?? []).length);

  // Actualiza un curso de Igualdad cargado en una versión anterior: agrega actividades, ejemplos y enlaces
  const actualizarCurso = () => {
    const nuevo = cursoIgualdad2026();
    setTopics((prev) => prev.map((t) => {
      const n = nuevo.topics.find((x) => x.id === t.id);
      return n && !(t.actividades ?? []).length ? { ...t, actividades: n.actividades, notaMinimaModulo: n.notaMinimaModulo } : t;
    }));
    setMaterials((prev) => prev.map((m) => {
      const n = nuevo.materials.find((x) => x.id === m.id);
      return n && n.content !== m.content && !m.content.includes('Ejemplo práctico en planta') ? { ...m, content: n.content, recursos: n.recursos } : m;
    }));
    registrarAuditoria(currentUser, 'curso.igualdad_cargado', 'Actualización: actividades prácticas y ejemplos');
    notificar('success', 'Curso de Igualdad actualizado con actividades prácticas, ejemplos y enlaces oficiales.');
  };

  const completos = filas.filter((f) => f.r.completo).length;
  const sinIniciar = filas.filter((f) => f.r.estado === 'Pendiente').length;
  const promedio = filas.length ? filas.reduce((s, f) => s + f.r.total, 0) / filas.length : 0;
  const autoridadesPendientes = filas.filter((f) => f.user.esAutoridad && !f.r.completo);
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  const porGrupo = (clave: (f: Fila) => string) => Object.entries(filas.reduce<Record<string, Fila[]>>((acc, f) => {
    (acc[clave(f)] ??= []).push(f); return acc;
  }, {})).sort((a, b) => b[1].length - a[1].length);

  const visibles = filas.filter((f) =>
    (!filtroEstado || f.r.estado === filtroEstado) &&
    (!q || `${f.user.name} ${f.user.email} ${f.user.area ?? ''}`.toLowerCase().includes(q.toLowerCase())));

  const cargarCurso = () => {
    const { topics: t, materials: m, questions: qs } = cursoIgualdad2026();
    setTopics((prev) => [...t.filter((x) => !prev.some((p) => p.id === x.id)), ...prev]);
    setMaterials((prev) => [...prev, ...m.filter((x) => !prev.some((p) => p.id === x.id))]);
    setQuestions((prev) => [...prev, ...qs.filter((x) => !prev.some((p) => p.id === x.id))]);
    registrarAuditoria(currentUser, 'curso.igualdad_cargado', `${t.length} cursos, ${m.length} lecturas, ${qs.length} preguntas`);
    notificar('success', `Se cargaron ${t.length} cursos (40 h) con ${qs.length} preguntas. Revíselos en "Temas y Contenido".`);
  };

  const guardar = () => {
    guardarConfig({ ...cfg, anio: Number(cfg.anio), horasMinimas: Number(cfg.horasMinimas) });
    registrarAuditoria(currentUser, 'configuracion.plan', `${cfg.nombrePlan} · ${cfg.horasMinimas} h`);
    notificar('success', 'Configuración del plan guardada.');
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const nombre = (id: string) => users.find((u) => u.id === id);
      const grupos = porGrupo((f) => `${f.user.area ?? 'SIN ÁREA'}|${f.user.sexo === 'F' ? 'Mujeres' : f.user.sexo === 'M' ? 'Hombres' : 'No indicado'}`);
      await exportarExcel(`evidencias_capacitacion_igualdad_${config.anio}_${new Date().toISOString().slice(0, 10)}.xlsx`, [
        {
          nombre: 'Resumen por persona',
          titulo: `FUNDAMETZ S.A. · ${config.nombrePlan} · Capacitación en igualdad (Acuerdo MDT-2025-006)`,
          columnas: [
            { titulo: 'Cédula', valor: (f: Fila) => f.user.email, ancho: 13 },
            { titulo: 'Nombre completo', valor: (f: Fila) => f.user.name, ancho: 34 },
            { titulo: 'Sexo', valor: (f: Fila) => f.user.sexo ?? '', ancho: 7 },
            { titulo: 'Área', valor: (f: Fila) => f.user.area ?? '', ancho: 26 },
            { titulo: 'Máxima autoridad', valor: (f: Fila) => (f.user.esAutoridad ? 'Sí' : ''), ancho: 11 },
            { titulo: 'Horas virtuales', valor: (f: Fila) => f.r.virtuales, formato: '0.0', ancho: 10 },
            { titulo: 'Horas presenciales', valor: (f: Fila) => f.r.presenciales, formato: '0.0', ancho: 11 },
            { titulo: 'Total horas', valor: (f: Fila) => f.r.total, formato: '0.0', ancho: 9 },
            { titulo: 'Cursos acreditados', valor: (f: Fila) => `${f.r.cursos.filter((c) => c.acreditado).length}/${f.r.cursos.length}`, ancho: 11 },
            { titulo: 'Tiempo efectivo (h)', valor: (f: Fila) => Math.round((f.r.segundosEstudio / 3600) * 10) / 10, formato: '0.0', ancho: 11 },
            { titulo: 'Estado', valor: (f: Fila) => f.r.estado, ancho: 12 },
            { titulo: 'Aceptó aviso LOPDP', valor: (f: Fila) => (f.user.consentimientoAt ? new Date(f.user.consentimientoAt) : null), formato: 'dd/mm/yyyy', ancho: 12 },
          ],
          filas,
        },
        {
          nombre: 'Resumen área y sexo',
          titulo: 'Cumplimiento agregado por área y sexo',
          columnas: [
            { titulo: 'Área', valor: (g: [string, Fila[]]) => g[0].split('|')[0], ancho: 30 },
            { titulo: 'Sexo', valor: (g: [string, Fila[]]) => g[0].split('|')[1], ancho: 14 },
            { titulo: 'Personas', valor: (g: [string, Fila[]]) => g[1].length, ancho: 10 },
            { titulo: 'Completaron', valor: (g: [string, Fila[]]) => g[1].filter((f) => f.r.completo).length, ancho: 12 },
            { titulo: '% cumplimiento', valor: (g: [string, Fila[]]) => g[1].filter((f) => f.r.completo).length / g[1].length, formato: '0%', ancho: 14 },
            { titulo: 'Horas promedio', valor: (g: [string, Fila[]]) => g[1].reduce((s, f) => s + f.r.total, 0) / g[1].length, formato: '0.0', ancho: 14 },
          ],
          filas: grupos.sort((a, b) => a[0].localeCompare(b[0])),
        },
        {
          nombre: 'Tiempo de estudio',
          titulo: 'Registro diario de tiempo efectivo de estudio (evidencia)',
          columnas: [
            { titulo: 'Fecha', valor: (t: typeof tiempos[number]) => new Date(`${t.fecha}T12:00:00`), formato: 'dd/mm/yyyy', ancho: 12 },
            { titulo: 'Cédula', valor: (t: typeof tiempos[number]) => nombre(t.userId)?.email ?? '', ancho: 13 },
            { titulo: 'Colaborador', valor: (t: typeof tiempos[number]) => nombre(t.userId)?.name ?? t.userId, ancho: 32 },
            { titulo: 'Curso', valor: (t: typeof tiempos[number]) => topics.find((x) => x.id === t.topicId)?.title ?? t.topicId, ancho: 44 },
            { titulo: 'Minutos', valor: (t: typeof tiempos[number]) => Math.round(t.segundos / 60), ancho: 9 },
            { titulo: 'Inicio', valor: (t: typeof tiempos[number]) => new Date(t.primerRegistro).toLocaleString('es-EC'), ancho: 20 },
            { titulo: 'Último registro', valor: (t: typeof tiempos[number]) => new Date(t.ultimoRegistro).toLocaleString('es-EC'), ancho: 20 },
          ],
          filas: [...tiempos].sort((a, b) => a.fecha.localeCompare(b.fecha)),
        },
        {
          nombre: 'Evaluaciones',
          titulo: 'Intentos de evaluación registrados',
          columnas: [
            { titulo: 'Fecha', valor: (a: QuizAttempt) => new Date(a.takenAt).toLocaleString('es-EC'), ancho: 20 },
            { titulo: 'Cédula', valor: (a: QuizAttempt) => a.userEmail, ancho: 13 },
            { titulo: 'Colaborador', valor: (a: QuizAttempt) => a.userName, ancho: 32 },
            { titulo: 'Curso', valor: (a: QuizAttempt) => a.topicTitle, ancho: 44 },
            { titulo: 'Tipo', valor: (a: QuizAttempt) => (a.type === 'initial' ? 'Diagnóstico' : 'Final'), ancho: 11 },
            { titulo: 'Nota (/10)', valor: (a: QuizAttempt) => a.score, formato: '0.0', ancho: 9 },
            { titulo: 'Resultado', valor: (a: QuizAttempt) => (a.passed ? 'Aprobado' : 'No aprobado'), ancho: 12 },
            { titulo: 'Duración (min)', valor: (a: QuizAttempt) => Math.round(a.durationSeconds / 60), ancho: 10 },
          ],
          filas: attempts.filter((a) => cursosMdt.some((t) => t.id === a.topicId)),
        },
        {
          nombre: 'Asistencia presencial',
          titulo: 'Asistencia a sesiones presenciales',
          columnas: [
            { titulo: 'Fecha', valor: (x: { s: typeof sesiones[number]; u: string }) => new Date(`${x.s.fecha}T12:00:00`), formato: 'dd/mm/yyyy', ancho: 12 },
            { titulo: 'Tema', valor: (x: { s: typeof sesiones[number] }) => x.s.tema, ancho: 36 },
            { titulo: 'Eje', valor: (x: { s: typeof sesiones[number] }) => EJES_MDT[x.s.eje], ancho: 34 },
            { titulo: 'Horas', valor: (x: { s: typeof sesiones[number] }) => x.s.horas, formato: '0.0', ancho: 8 },
            { titulo: 'Facilitador(a)', valor: (x: { s: typeof sesiones[number] }) => x.s.facilitador, ancho: 22 },
            { titulo: 'Cédula', valor: (x: { u: string }) => nombre(x.u)?.email ?? '', ancho: 13 },
            { titulo: 'Colaborador', valor: (x: { u: string }) => nombre(x.u)?.name ?? x.u, ancho: 32 },
          ],
          filas: sesiones.filter((s) => s.fecha.startsWith(String(config.anio))).flatMap((s) => s.asistentes.map((u) => ({ s, u }))),
        },
        {
          nombre: 'Plan y contenidos',
          titulo: `${config.nombrePlan} · cursos que acreditan horas`,
          columnas: [
            { titulo: 'Curso', valor: (t: Topic) => t.title, ancho: 50 },
            { titulo: 'Eje MDT-2025-006', valor: (t: Topic) => (t.ejeMdt ? EJES_MDT[t.ejeMdt] : ''), ancho: 40 },
            { titulo: 'Horas', valor: (t: Topic) => t.horasAcreditadas ?? 0, formato: '0.0', ancho: 8 },
            { titulo: 'Tiempo mínimo (min)', valor: (t: Topic) => t.minutosMinimos ?? 0, ancho: 12 },
            { titulo: 'Nota mínima (/10)', valor: (t: Topic) => t.minScoreToPass, ancho: 11 },
            { titulo: 'Estado', valor: (t: Topic) => (t.status === 'published' ? 'Publicado' : 'Borrador'), ancho: 11 },
          ],
          filas: cursosMdt,
        },
      ]);
      registrarAuditoria(currentUser, 'reporte.mdt_exportado', `${filas.length} personas`);
    } catch (e: any) {
      notificar('error', `No se pudo generar el Excel: ${e?.message ?? e}`);
    } finally {
      setExportando(false);
    }
  };

  const Barras = ({ titulo, grupos }: { titulo: string; grupos: [string, Fila[]][] }) => (
    <Tarjeta className="p-5">
      <h3 className="text-sm font-bold text-[#0F172A] mb-3">{titulo}</h3>
      <div className="space-y-3">
        {grupos.map(([g, l]) => {
          const c = l.filter((f) => f.r.completo).length;
          const p = l.filter((f) => !f.r.completo && f.r.estado === 'En progreso').length;
          return (
            <div key={g}>
              <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-[#0F172A]">{g}</span><span className="text-[#64748B]">{c}/{l.length} · {pct(c, l.length)}%</span></div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-[#E8EBED]">
                <div className="bg-[#00AC18]" style={{ width: `${pct(c, l.length)}%` }} />
                <div className="bg-amber-400" style={{ width: `${pct(p, l.length)}%` }} />
              </div>
            </div>
          );
        })}
        {grupos.length === 0 && <p className="text-xs text-[#64748B]">Sin colaboradores registrados.</p>}
      </div>
    </Tarjeta>
  );

  return (
    <div className="space-y-5">
      <Encabezado titulo="Cumplimiento MDT · 40 horas en igualdad"
        subtitulo={`${config.nombrePlan} · Acuerdo Ministerial MDT-2025-006 · meta ${fmtHoras(config.horasMinimas)} por persona`}
        acciones={<Boton variante="exito" cargando={exportando} onClick={exportar}><FileSpreadsheet className="h-4 w-4" />Excel de evidencias MDT</Boton>} />

      {avisoBD && <Aviso tipo="alerta">{avisoBD}</Aviso>}

      {!yaCargado && (
        <Tarjeta className="p-5 border-[#2563EB] bg-blue-50/40 flex flex-col sm:flex-row sm:items-center gap-4">
          <BookOpenCheck className="h-10 w-10 text-[#2563EB] shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-[#0F172A]">Curso de Igualdad 2026 listo para cargar</h3>
            <p className="text-xs text-[#64748B] mt-1">5 cursos de 8 horas que cubren los cuatro ejes del Acuerdo MDT-2025-006: derechos laborales, igualdad de género, trabajo de igual valor, erradicación de la violencia, más inclusión. Incluye 14 lecturas con ejemplos en planta, 10 actividades prácticas y 50 preguntas. Puede editarlos después en "Temas y Contenido".</p>
          </div>
          <Boton onClick={cargarCurso}><Download className="h-4 w-4" />Cargar curso (40 h)</Boton>
        </Tarjeta>
      )}

      {sinActividades && (
        <Aviso tipo="info">
          El curso de Igualdad se cargó con una versión anterior. <button onClick={actualizarCurso} className="font-bold underline">Actualizarlo ahora</button> para agregar las 10 actividades prácticas, los ejemplos en planta y los enlaces oficiales.
        </Aviso>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { i: <Users className="h-5 w-5" />, e: 'Personas obligadas', v: filas.length, d: 'colaboradores y autoridades activos' },
          { i: <Award className="h-5 w-5" />, e: `Completaron ${config.horasMinimas} h`, v: `${pct(completos, filas.length)}%`, d: `${completos} personas` },
          { i: <Clock className="h-5 w-5" />, e: 'Promedio de horas', v: fmtHoras(Math.round(promedio * 10) / 10), d: `de ${config.horasMinimas} h requeridas` },
          { i: <UserX className="h-5 w-5" />, e: 'Sin iniciar', v: sinIniciar, d: 'no registran estudio' },
        ].map((x) => (
          <Tarjeta key={x.e} className="p-4 flex gap-3 items-start">
            <div className="h-10 w-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">{x.i}</div>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{x.e}</p><p className="text-2xl font-bold text-[#0F172A] leading-tight">{x.v}</p><p className="text-[11px] text-[#64748B]">{x.d}</p></div>
          </Tarjeta>
        ))}
      </div>

      {autoridadesPendientes.length > 0 && (
        <Aviso tipo="alerta"><AlertTriangle className="inline h-4 w-4 mr-1" />La normativa exige la participación de las máximas autoridades. Pendientes: {autoridadesPendientes.map((f) => f.user.name).join(', ')}.</Aviso>
      )}
      {faltanEjes.length > 0 && cursosMdt.length > 0 && (
        <Aviso tipo="alerta">Ejes del Acuerdo MDT-2025-006 sin ningún curso o sesión: {faltanEjes.map((e) => EJES_MDT[e]).join(', ')}.</Aviso>
      )}
      {cursosMdt.length > 0 && horasVirtualesPlan < config.horasMinimas && (
        <Aviso tipo="info">Los cursos publicados suman {fmtHoras(horasVirtualesPlan)}. Complemente con sesiones presenciales para llegar a {fmtHoras(config.horasMinimas)}.</Aviso>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Barras titulo="Avance por área" grupos={porGrupo((f) => f.user.area ?? 'SIN ÁREA')} />
        <div className="space-y-5">
          <Barras titulo="Avance por sexo" grupos={porGrupo((f) => (f.user.sexo === 'F' ? 'Mujeres' : f.user.sexo === 'M' ? 'Hombres' : 'No indicado'))} />
          <Tarjeta className="p-5">
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">Configuración del plan</h3>
            <div className="space-y-3">
              <div><label className={etiqueta}>Nombre del plan</label><input className={campo} value={cfg.nombrePlan} onChange={(e) => setCfg({ ...cfg, nombrePlan: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={etiqueta}>Año</label><input type="number" className={campo} value={cfg.anio} onChange={(e) => setCfg({ ...cfg, anio: Number(e.target.value) })} /></div>
                <div><label className={etiqueta}>Horas mínimas</label><input type="number" min={1} className={campo} value={cfg.horasMinimas} onChange={(e) => setCfg({ ...cfg, horasMinimas: Number(e.target.value) })} /></div>
              </div>
              <Boton variante="secundario" className="w-full" onClick={guardar}><Save className="h-4 w-4" />Guardar</Boton>
            </div>
          </Tarjeta>
        </div>
      </div>

      <Tarjeta>
        <div className="p-4 border-b border-[#E0E0E0] flex flex-wrap gap-2 items-center">
          <h3 className="text-sm font-bold text-[#0F172A] mr-auto">Horas por colaborador</h3>
          <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input className={`${campo} pl-8 w-56`} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className={`${campo} w-auto`} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option><option>Completo</option><option>En progreso</option><option>Pendiente</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead><tr className="bg-[#F8FAFC] text-[10px] uppercase tracking-wide text-[#64748B] border-b border-[#E0E0E0]">
              <th className="py-2.5 px-4">Colaborador</th><th className="px-3">Área</th><th className="px-3">Sexo</th><th className="px-3">Virtual</th><th className="px-3">Presencial</th><th className="px-3 w-44">Total</th><th className="px-3">Tiempo efectivo</th><th className="px-3">Estado</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {visibles.map(({ user, r }) => (
                <tr key={user.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 px-4"><p className="font-semibold text-[#0F172A]">{user.name}{user.esAutoridad && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#1E3A8A] text-white rounded">Autoridad</span>}</p><p className="text-[11px] text-[#64748B] font-mono">{user.email}</p></td>
                  <td className="px-3 text-[11px]">{user.area ?? '—'}</td>
                  <td className="px-3">{user.sexo ?? '—'}</td>
                  <td className="px-3">{fmtHoras(r.virtuales)}</td>
                  <td className="px-3">{fmtHoras(r.presenciales)}</td>
                  <td className="px-3"><p className="font-bold text-[#0F172A]">{fmtHoras(r.total)} <span className="font-normal text-[#64748B]">/ {fmtHoras(r.minimas)}</span></p><Barra valor={(r.total / r.minimas) * 100} color={r.completo ? 'bg-[#00AC18]' : 'bg-[#2563EB]'} className="mt-1" /></td>
                  <td className="px-3">{fmtMinutos(r.segundosEstudio)}</td>
                  <td className="px-3"><span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${ESTADO_COLOR[r.estado]}`}>{r.estado}</span></td>
                </tr>
              ))}
              {visibles.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-[#64748B]">No hay colaboradores con esos filtros.</td></tr>}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta className="p-5">
        <h3 className="text-sm font-bold text-[#0F172A] mb-1">Cursos que acreditan horas</h3>
        <p className="text-xs text-[#64748B] mb-3">Configure "Horas acreditadas", "Eje MDT" y "Tiempo mínimo" al crear o editar un curso en "Temas y Contenido". Un curso acredita sus horas cuando el colaborador aprueba la evaluación final y cumple el tiempo mínimo de estudio.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {cursosMdt.map((t) => (
            <div key={t.id} className="p-3 border border-[#E0E0E0] rounded-lg text-xs">
              <p className="font-semibold text-[#0F172A]">{t.title}</p>
              <p className="text-[#64748B] mt-0.5">{t.ejeMdt ? EJES_MDT[t.ejeMdt] : 'Sin eje'} · {fmtHoras(t.horasAcreditadas ?? 0)} · mínimo {t.minutosMinimos ?? 0} min · {t.status === 'published' ? 'Publicado' : 'Borrador'}</p>
            </div>
          ))}
          {cursosMdt.length === 0 && <p className="text-xs text-[#64748B]">Ningún curso acredita horas todavía.</p>}
        </div>
      </Tarjeta>
    </div>
  );
}
