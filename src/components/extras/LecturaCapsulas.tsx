// Microaprendizaje: divide una lectura en cápsulas cortas (≈2–5 min), con una pregunta rápida opcional
// al final de cada una, y permite escuchar la cápsula en voz alta.
//
// Sintaxis de la pregunta rápida dentro del texto de la lectura (Administración → material):
//   ?? ¿Pregunta?
//   [ ] Opción incorrecta
//   [x] Opción correcta
//   >> Explicación que se muestra después de responder (opcional)
// La pregunta cierra la cápsula en la que aparece.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Gauge, Headphones, Lightbulb, Pause, Play, Square, XCircle } from 'lucide-react';
import { Markdown } from '../../lib/markdown';
import { Lector, frasesParaLeer, vozDisponible, type EstadoLector } from '../../lib/voz';

export type PreguntaRapida = { pregunta: string; opciones: { texto: string; correcta: boolean }[]; explicacion?: string };
export type Capsula = { titulo: string; markdown: string; palabras: number; minutos: number; pregunta?: PreguntaRapida };

const PALABRAS_MIN = 60;        // una cápsula se cierra al superar este número de palabras (≈ una pantalla de celular)
const PALABRAS_MIN_FINAL = 35;  // una cápsula final más corta se une a la anterior
const PALABRAS_POR_MINUTO = 130;

const contar = (t: string) => t.replace(/[#>*_-]/g, ' ').split(/\s+/).filter(Boolean).length;

/** Divide el Markdown de una lectura en cápsulas. */
export function dividirEnCapsulas(contenido: string): Capsula[] {
  const lineas = (contenido || '').replace(/\r/g, '').split('\n');
  // 1) Secciones por títulos "## " y extracción de preguntas rápidas
  type Seccion = { titulo: string; lineas: string[]; pregunta?: PreguntaRapida };
  const secciones: Seccion[] = [];
  let actual: Seccion = { titulo: '', lineas: [] };
  const cerrar = () => { if (actual.lineas.some((l) => l.trim()) || actual.pregunta) secciones.push(actual); };
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (l.startsWith('## ')) { cerrar(); actual = { titulo: l.slice(3).trim(), lineas: [l] }; continue; }
    if (l.startsWith('?? ')) {
      const p: PreguntaRapida = { pregunta: l.slice(3).trim(), opciones: [] };
      while (i + 1 < lineas.length && /^\s*(\[( |x|X)\]|>>)/.test(lineas[i + 1])) {
        const o = lineas[++i].trim();
        if (o.startsWith('>>')) p.explicacion = o.slice(2).trim();
        else p.opciones.push({ texto: o.slice(3).trim(), correcta: /^\[(x|X)\]/.test(o) });
      }
      if (p.opciones.length >= 2) actual.pregunta = p;
      cerrar(); actual = { titulo: '', lineas: [] };
      continue;
    }
    actual.lineas.push(l);
  }
  cerrar();
  if (!secciones.length) return [];

  // 2) Agrupar secciones en cápsulas de tamaño cómodo
  const capsulas: Capsula[] = [];
  let grupo: Seccion[] = [];
  const emitir = () => {
    if (!grupo.length) return;
    const markdown = grupo.map((s) => s.lineas.join('\n')).join('\n\n').trim();
    const palabras = contar(markdown);
    capsulas.push({
      titulo: grupo.find((s) => s.titulo)?.titulo ?? '',
      markdown, palabras,
      minutos: Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO + (grupo.some((s) => s.pregunta) ? 0.5 : 0))),
      pregunta: grupo.find((s) => s.pregunta)?.pregunta,
    });
    grupo = [];
  };
  for (const s of secciones) {
    grupo.push(s);
    const palabras = contar(grupo.map((g) => g.lineas.join(' ')).join(' '));
    if (s.pregunta || palabras >= PALABRAS_MIN) emitir();
  }
  if (grupo.length) {
    const resto = contar(grupo.map((g) => g.lineas.join(' ')).join(' '));
    const previa = capsulas[capsulas.length - 1];
    if (previa && !previa.pregunta && resto < PALABRAS_MIN_FINAL && !grupo.some((g) => g.pregunta)) {
      previa.markdown += '\n\n' + grupo.map((s) => s.lineas.join('\n')).join('\n\n');
      previa.palabras = contar(previa.markdown);
      previa.minutos = Math.max(1, Math.round(previa.palabras / PALABRAS_POR_MINUTO));
      grupo = [];
    } else emitir();
  }
  return capsulas;
}

// ------------------------------------------------------------------ Avance guardado por usuario y lectura
type Avance = { actual: number; vistas: number[]; respondidas: Record<number, number> };
const CLAVE = (u: string, m: string) => `academia_capsulas_${u}_${m}`;
const leerAvance = (u: string, m: string): Avance => {
  try { return { actual: 0, vistas: [0], respondidas: {}, ...JSON.parse(localStorage.getItem(CLAVE(u, m)) || '{}') }; }
  catch { return { actual: 0, vistas: [0], respondidas: {} }; }
};
const guardarAvance = (u: string, m: string, a: Avance) => { try { localStorage.setItem(CLAVE(u, m), JSON.stringify(a)); } catch { /* */ } };

/** true si el colaborador ya recorrió todas las cápsulas (y respondió sus preguntas). */
export function lecturaRecorrida(userId: string, materialId: string, contenido: string): boolean {
  const caps = dividirEnCapsulas(contenido);
  if (caps.length === 0 || (caps.length === 1 && !caps[0].pregunta)) return true;
  const a = leerAvance(userId, materialId);
  return caps.every((c, i) => a.vistas.includes(i) && (!c.pregunta || a.respondidas[i] !== undefined));
}

// ------------------------------------------------------------------ Componente
export default function LecturaCapsulas({ userId, materialId, contenido, onRecorrida }:
  { userId: string; materialId: string; contenido: string; onRecorrida?: () => void }) {
  const capsulas = useMemo(() => dividirEnCapsulas(contenido), [contenido]);
  const [avance, setAvance] = useState<Avance>(() => leerAvance(userId, materialId));
  const total = capsulas.length;
  const i = Math.min(avance.actual, Math.max(0, total - 1));
  const cap = capsulas[i];
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => { setAvance(leerAvance(userId, materialId)); }, [userId, materialId]);

  const actualizar = (cambio: (a: Avance) => Avance) => setAvance((a) => { const n = cambio(a); guardarAvance(userId, materialId, n); return n; });

  // Avisar cuando la lectura quedó recorrida por completo
  useEffect(() => {
    if (total >= 1 && capsulas.every((c, k) => avance.vistas.includes(k) && (!c.pregunta || avance.respondidas[k] !== undefined))) onRecorrida?.();
  }, [avance, capsulas, total, onRecorrida]);

  // ---- Voz
  const [estadoVoz, setEstadoVoz] = useState<EstadoLector>('detenido');
  const [frase, setFrase] = useState({ i: 0, total: 0 });
  const [velocidad, setVelocidad] = useState(() => { try { return Number(localStorage.getItem('academia_voz_velocidad')) || 1; } catch { return 1; } });
  const lector = useRef<Lector | null>(null);
  if (!lector.current && vozDisponible()) lector.current = new Lector((e, k, t) => { setEstadoVoz(e); setFrase({ i: k, total: t }); });
  const frases = useMemo(() => (cap ? frasesParaLeer(cap.markdown) : []), [cap]);
  useEffect(() => { lector.current?.cargar(frases); }, [frases]);
  useEffect(() => () => lector.current?.detener(), []);
  useEffect(() => { if (lector.current) lector.current.velocidad = velocidad; }, [velocidad]);

  const alternarVoz = () => {
    const l = lector.current; if (!l) return;
    if (l.estado === 'leyendo') l.pausar(); else l.leer();
  };
  const cambiarVelocidad = () => {
    const opciones = [0.85, 1, 1.2];
    const v = opciones[(opciones.indexOf(velocidad) + 1) % opciones.length] ?? 1;
    setVelocidad(v);
    try { localStorage.setItem('academia_voz_velocidad', String(v)); } catch { /* */ }
    lector.current?.cambiarVelocidad(v);
  };

  if (total <= 1) {
    // Lectura corta: se muestra completa, solo con el botón de escuchar.
    return (
      <div className="space-y-4">
        {vozDisponible() && cap && <BarraVoz estado={estadoVoz} frase={lector.current?.fraseActual ?? ''} progreso={frase} velocidad={velocidad}
          onAlternar={alternarVoz} onDetener={() => lector.current?.detener()} onVelocidad={cambiarVelocidad} />}
        <Markdown texto={cap?.markdown ?? contenido} />
        {cap?.pregunta && <PreguntaCapsula p={cap.pregunta} elegida={avance.respondidas[0]} onResponder={(k) => actualizar((a) => ({ ...a, respondidas: { ...a.respondidas, [0]: k } }))} />}
      </div>
    );
  }

  const respondida = !cap.pregunta || avance.respondidas[i] !== undefined;
  const ir = (n: number) => {
    lector.current?.detener();
    actualizar((a) => ({ ...a, actual: n, vistas: a.vistas.includes(n) ? a.vistas : [...a.vistas, n] }));
    window.setTimeout(() => raiz.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };
  const minutosRestantes = capsulas.slice(i).reduce((s, c) => s + c.minutos, 0);

  return (
    <div ref={raiz} className="space-y-4 scroll-mt-20">
      {/* Encabezado de la cápsula y progreso */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500">Cápsula {i + 1} de {total} · <span className="text-slate-700">≈ {cap.minutos} min</span></p>
          <p className="text-xs text-slate-500 hidden sm:block">Te quedan ≈ {minutosRestantes} min</p>
        </div>
        <div className="mt-2 flex gap-1.5" role="list" aria-label="Cápsulas de la lectura">
          {capsulas.map((c, k) => {
            const vista = avance.vistas.includes(k);
            return (
              <button key={k} role="listitem" onClick={() => vista && ir(k)} disabled={!vista} title={c.titulo || `Cápsula ${k + 1}`} aria-label={`Cápsula ${k + 1}${c.titulo ? `: ${c.titulo}` : ''}`}
                className={`tactil-compacto h-2 flex-1 rounded-full transition-colors ${k === i ? 'bg-[#2563EB]' : vista ? 'bg-[#93C5FD] hover:bg-[#60A5FA] cursor-pointer' : 'bg-slate-200 cursor-default'}`} />
            );
          })}
        </div>
      </div>

      {vozDisponible() && <BarraVoz estado={estadoVoz} frase={lector.current?.fraseActual ?? ''} progreso={frase} velocidad={velocidad}
        onAlternar={alternarVoz} onDetener={() => lector.current?.detener()} onVelocidad={cambiarVelocidad} />}

      <div key={i} className="capsula-entrada">
        <Markdown texto={cap.markdown} />
        {cap.pregunta && (
          <PreguntaCapsula p={cap.pregunta} elegida={avance.respondidas[i]}
            onResponder={(k) => actualizar((a) => ({ ...a, respondidas: { ...a.respondidas, [i]: k } }))} />
        )}
      </div>

      {/* Navegación entre cápsulas */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button onClick={() => ir(i - 1)} disabled={i === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-0">
          <ArrowLeft className="h-4 w-4" />Anterior
        </button>
        {i < total - 1 ? (
          <button onClick={() => ir(i + 1)} disabled={!respondida}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none">
            {respondida ? <>Siguiente cápsula <ArrowRight className="h-4 w-4" /></> : 'Responde la pregunta para continuar'}
          </button>
        ) : (
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${respondida ? 'text-emerald-700' : 'text-slate-500'}`}>
            {respondida ? <><CheckCircle2 className="h-4 w-4" />Terminaste la lectura</> : 'Responde la pregunta para terminar'}
          </span>
        )}
      </div>
      <style>{`@keyframes capsulaEntrada{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}.capsula-entrada{animation:capsulaEntrada .25s ease-out both}@media (prefers-reduced-motion: reduce){.capsula-entrada{animation:none}}`}</style>
    </div>
  );
}

// ------------------------------------------------------------------ Piezas
function BarraVoz({ estado, frase, progreso, velocidad, onAlternar, onDetener, onVelocidad }: {
  estado: EstadoLector; frase: string; progreso: { i: number; total: number }; velocidad: number;
  onAlternar: () => void; onDetener: () => void; onVelocidad: () => void;
}) {
  const activo = estado !== 'detenido';
  return (
    <div className={`rounded-xl border px-3 py-2.5 flex flex-wrap items-center gap-2 transition-colors ${activo ? 'border-[#BFDBFE] bg-[#EFF6FF]' : 'border-slate-200 bg-white'}`}>
      <button onClick={onAlternar} aria-label={estado === 'leyendo' ? 'Pausar lectura' : 'Escuchar la lección'}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold">
        {estado === 'leyendo' ? <><Pause className="h-4 w-4" />Pausar</> : estado === 'pausado' ? <><Play className="h-4 w-4" />Continuar</> : <><Headphones className="h-4 w-4" />Escuchar</>}
      </button>
      {activo && (
        <button onClick={onDetener} aria-label="Detener lectura" className="p-2 rounded-lg text-slate-600 hover:bg-white"><Square className="h-4 w-4" /></button>
      )}
      <button onClick={onVelocidad} title="Velocidad de lectura" className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
        <Gauge className="h-4 w-4" />{velocidad === 1 ? 'Normal' : velocidad < 1 ? 'Lenta' : 'Rápida'}
      </button>
      {activo ? (
        <p className="basis-full sm:basis-auto sm:flex-1 min-w-0 text-sm text-[#1E40AF] leading-snug" aria-live="polite">
          <span className="text-xs text-slate-500 mr-1.5">{progreso.i + 1}/{progreso.total}</span>{frase}
        </p>
      ) : (
        <p className="text-xs text-slate-500 sm:flex-1">Escucha esta parte de la lección en voz alta.</p>
      )}
    </div>
  );
}

function PreguntaCapsula({ p, elegida, onResponder }: { p: PreguntaRapida; elegida?: number; onResponder: (k: number) => void }) {
  const respondida = elegida !== undefined;
  const acierto = respondida && p.opciones[elegida]?.correcta;
  return (
    <div className="mt-5 rounded-2xl border border-[#BFDBFE] bg-[#F8FBFF] p-4 sm:p-5">
      <p className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]"><Lightbulb className="h-4 w-4" />Comprueba lo aprendido</p>
      <p className="mt-1.5 text-[15px] font-semibold text-slate-900 leading-snug">{p.pregunta}</p>
      <div className="mt-3 grid gap-2">
        {p.opciones.map((o, k) => {
          const elegidaEsta = elegida === k;
          const estilo = !respondida
            ? 'border-slate-200 bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]'
            : o.correcta
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : elegidaEsta ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 bg-white opacity-60';
          return (
            <button key={k} onClick={() => !respondida && onResponder(k)} disabled={respondida && !elegidaEsta && !o.correcta}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border text-sm transition-colors ${estilo}`}>
              <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${respondida && o.correcta ? 'border-emerald-500 bg-emerald-500 text-white' : respondida && elegidaEsta ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300'}`}>
                {respondida && o.correcta ? <CheckCircle2 className="h-3.5 w-3.5" /> : respondida && elegidaEsta ? <XCircle className="h-3.5 w-3.5" /> : null}
              </span>
              <span className="leading-snug">{o.texto}</span>
            </button>
          );
        })}
      </div>
      {respondida && (
        <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${acierto ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`} aria-live="polite">
          <strong>{acierto ? '¡Correcto!' : 'Repasemos:'}</strong> {p.explicacion ?? (acierto ? 'Vas muy bien.' : 'La respuesta correcta está marcada en verde.')}
        </div>
      )}
    </div>
  );
}
