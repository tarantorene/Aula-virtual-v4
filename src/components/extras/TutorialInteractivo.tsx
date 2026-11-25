// Recorrido guiado (estilo corporativo): resalta una zona de la pantalla y explica para qué sirve.
// Nunca bloquea al usuario: puede probar la opción resaltada o simplemente pulsar "Siguiente".
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import type { User } from '../../types';

// ------------------------------------------------------------------ Persistencia
const CLAVE = (id: string) => `academia_tutorial_${id}`;
const CLAVE_VOZ = 'academia_recorrido_voz';
type EstadoGuardado = { completado?: boolean; pospuesto?: boolean; fecha?: string };
const leer = (id: string): EstadoGuardado => { try { return JSON.parse(localStorage.getItem(CLAVE(id)) || '{}'); } catch { return {}; } };
const guardar = (id: string, e: EstadoGuardado) => { try { localStorage.setItem(CLAVE(id), JSON.stringify({ ...leer(id), ...e })); } catch { /* sin almacenamiento */ } };
/** true si el recorrido no debe abrirse solo (ya lo terminó o eligió "Ahora no"). */
export const recorridoYaVisto = (id: string) => { const e = leer(id); return !!(e.completado || e.pospuesto); };

// ------------------------------------------------------------------ Pasos
type Paso = {
  id: string;
  objetivo?: string;          // id del elemento a resaltar; sin objetivo = ventana centrada
  alternos?: string[];        // ids alternativos si el objetivo no está visible
  titulo: string;
  texto: string;
  prueba?: string;            // invitación opcional a probar la opción resaltada
  alAvanzar?: () => void;     // acción automática al pulsar "Siguiente"
  preparar?: () => void;      // se ejecuta si el objetivo no aparece
};

const pulsar = (sel: string) => (document.querySelector(sel) as HTMLElement | null)?.click();
const visible = (id: string) => { const e = document.getElementById(id); const b = e?.getBoundingClientRect(); return e && b && b.width >= 2 && b.height >= 2 ? e : null; };

export const PASOS_RECORRIDO: Paso[] = [
  { id: 'bienvenida', titulo: 'Bienvenido al Aula Virtual',
    texto: 'En este breve recorrido verás dónde están tu plan de capacitación, tus cursos y la evaluación final. Toma menos de dos minutos.' },
  { id: 'plan', objetivo: 'tour-plan', titulo: 'Tu plan de 40 horas',
    texto: 'Aquí ves las horas acumuladas, los cursos acreditados y el siguiente paso pendiente. Al completar el plan, aquí aparece tu certificado.' },
  { id: 'pendientes', objetivo: 'tour-tab-pendientes', titulo: 'Filtra tus cursos',
    texto: 'Usa las pestañas Todos, Pendientes y Aprobados para ubicar rápidamente tus capacitaciones.',
    prueba: 'Pruébalo: toca «Pendientes».' },
  { id: 'curso', objetivo: 'tour-curso-0', titulo: 'Abre un curso',
    texto: 'Cada tarjeta es un curso asignado. Al abrirlo encontrarás sus lecturas, las actividades prácticas y la evaluación final.',
    prueba: 'Pruébalo: toca la tarjeta, o pulsa Siguiente y la abrimos por ti.',
    preparar: () => pulsar('#tour-pestanas button'),
    alAvanzar: () => pulsar('#tour-curso-0') },
  { id: 'modulo', objetivo: 'tour-panel-modulo', titulo: 'Objetivo, nota y actividades',
    texto: 'Este panel muestra las horas que acredita el curso y tu nota del módulo. Las actividades prácticas se responden por escrito después de las lecturas y suman puntos a tu nota.' },
  { id: 'evaluacion', objetivo: 'tour-evaluacion', alternos: ['tour-rendir'], titulo: 'Evaluación final',
    texto: 'Al terminar las lecturas y las actividades se habilita la evaluación final. Necesitas la nota mínima para aprobar y tienes un número limitado de intentos. Puedes volver a ver este recorrido desde el Tablero.',
    preparar: () => pulsar('#tour-indice') },
];

/** Texto para grabar los audios (un mp3 por id). */
export const guionRecorrido = () => PASOS_RECORRIDO.map((p) => `${p.id}.mp3\n${p.texto}`).join('\n\n');

// ------------------------------------------------------------------ Voz opcional
const BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
const PREFERENCIA_IDIOMA = ['es-EC', 'es-US', 'es-MX', 'es-419', 'es-CO', 'es-PE'];

function elegirVoz(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voces = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
  if (!voces.length) return null;
  const puntaje = (v: SpeechSynthesisVoice) => {
    const i = PREFERENCIA_IDIOMA.findIndex((l) => v.lang.toLowerCase() === l.toLowerCase());
    return (i >= 0 ? 100 - i * 5 : v.lang.toLowerCase() === 'es-es' ? 40 : 50) + (/natural|neural|online|google/i.test(v.name) ? 20 : 0);
  };
  return [...voces].sort((a, b) => puntaje(b) - puntaje(a))[0];
}

function useNarrador(activa: boolean) {
  const manifiesto = useRef<Set<string> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`${BASE}tour/manifest.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : { audios: [] }))
      .then((j) => { manifiesto.current = new Set(Array.isArray(j?.audios) ? j.audios : []); })
      .catch(() => { manifiesto.current = new Set(); });
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }, []);

  const callar = useCallback(() => {
    audio.current?.pause();
    audio.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const tts = useCallback((texto: string) => {
    if (!('speechSynthesis' in window)) return;
    const s = window.speechSynthesis;
    s.cancel();
    const voz = elegirVoz();
    (texto.match(/[^.!?]+[.!?]*/g) ?? [texto]).map((f) => f.trim()).filter(Boolean).forEach((f) => {
      const u = new SpeechSynthesisUtterance(f);
      u.lang = voz?.lang ?? 'es-419';
      if (voz) u.voice = voz;
      s.speak(u);
    });
  }, []);

  const decir = useCallback((id: string, texto: string) => {
    callar();
    if (!activa) return;
    if (manifiesto.current?.has(id)) {
      const a = new Audio(`${BASE}tour/${id}.mp3`);
      audio.current = a;
      a.onerror = () => tts(texto);
      a.play().catch(() => tts(texto));
    } else tts(texto);
  }, [activa, callar, tts]);

  useEffect(() => callar, [callar]);
  return { decir, callar };
}

// ------------------------------------------------------------------ Componente
type Rect = { top: number; left: number; width: number; height: number };
const MARGEN = 6;

export function RecorridoGuiado({ user, onTerminar, onIrTablero, onCompletado }: {
  user: User;
  onTerminar: () => void;
  onIrTablero: () => void;
  onCompletado?: () => void;
}) {
  const vozDisponible = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [listo, setListo] = useState(false);
  const [voz, setVoz] = useState(() => { try { return localStorage.getItem(CLAVE_VOZ) === '1'; } catch { return false; } });
  const { decir, callar } = useNarrador(voz);
  const paso = PASOS_RECORRIDO[i];
  const ultimo = i === PASOS_RECORRIDO.length - 1;
  const avanzando = useRef(false);

  useEffect(() => { onIrTablero(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ir = useCallback((n: number) => {
    avanzando.current = false;
    setListo(false);
    setRect(null);
    setI(Math.max(0, Math.min(PASOS_RECORRIDO.length - 1, n)));
  }, []);

  const terminar = useCallback((completo: boolean) => {
    callar();
    guardar(user.id, completo ? { completado: true, fecha: new Date().toISOString() } : { pospuesto: true });
    if (completo) onCompletado?.();
    onTerminar();
  }, [callar, user.id, onCompletado, onTerminar]);

  const siguiente = useCallback(() => {
    if (ultimo) { terminar(true); return; }
    if (avanzando.current) return;
    avanzando.current = true;
    paso.alAvanzar?.();
    window.setTimeout(() => ir(i + 1), paso.alAvanzar ? 450 : 0);
  }, [ultimo, terminar, paso, i, ir]);

  // Localizar el objetivo; si no aparece, intentar prepararlo y, si no, saltar el paso.
  useEffect(() => {
    if (!paso.objetivo) { setListo(true); return; }
    let intentos = 0;
    let visto = false;
    let clave = '';
    let ajustes = 0;
    let ultimoScroll = 0;
    const tick = () => {
      const el = [paso.objetivo!, ...(paso.alternos ?? [])].map(visible).find(Boolean) ?? null;
      if (!el) {
        intentos++;
        if (intentos === 4) paso.preparar?.();
        if (intentos > 16) { window.clearInterval(t); if (i < PASOS_RECORRIDO.length - 1) ir(i + 1); else terminar(true); }
        return;
      }
      const r = el.getBoundingClientRect();
      if (!visto) {
        visto = true;
        // En celular la explicación ocupa la parte inferior: el elemento se lleva arriba, bajo el encabezado.
        const enCelular = window.innerWidth < 640;
        el.style.scrollMarginTop = enCelular ? '72px' : '';
        el.scrollIntoView({ behavior: 'smooth', block: enCelular || r.height > window.innerHeight * 0.55 ? 'start' : 'center', inline: 'nearest' });
        ultimoScroll = Date.now();
        window.setTimeout(() => setListo(true), 350);
      }
      // Si el contenido se movió (por ejemplo al desplegar el índice), volver a ubicar el elemento.
      const bajo = window.innerWidth < 640 ? window.innerHeight - 280 : window.innerHeight;
      if (visto && ajustes < 4 && Date.now() - ultimoScroll > 800 && r.height < bajo - 60 && (r.top < 56 || r.bottom > bajo)) {
        ajustes++; ultimoScroll = Date.now();
        el.style.scrollMarginTop = '72px';
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
      const k = [r.top, r.left, r.width, r.height].map(Math.round).join(',');
      if (k !== clave) { clave = k; setRect({ top: r.top, left: r.left, width: r.width, height: r.height }); }
    };
    tick();
    const t = window.setInterval(tick, 180);
    return () => window.clearInterval(t);
  }, [paso, i, ir, terminar]);

  // Si el usuario toca la opción resaltada (pasos con "Pruébalo"), avanzar solo.
  useEffect(() => {
    if (!listo || !paso.prueba || !paso.objetivo) return;
    const alClic = (e: MouseEvent) => {
      if (avanzando.current || !(e.target as HTMLElement | null)?.closest(`#${paso.objetivo}`)) return;
      avanzando.current = true;
      window.setTimeout(() => ir(i + 1), 450);
    };
    document.addEventListener('click', alClic, true);
    return () => document.removeEventListener('click', alClic, true);
  }, [listo, paso, i, ir]);

  useEffect(() => { if (listo) decir(paso.id, paso.texto); }, [listo, paso, decir]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') terminar(false);
      if (e.key === 'Enter' && listo) { e.preventDefault(); siguiente(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [listo, siguiente, terminar]);

  const alternarVoz = () => {
    const nueva = !voz;
    setVoz(nueva);
    try { localStorage.setItem(CLAVE_VOZ, nueva ? '1' : '0'); } catch { /* */ }
    if (!nueva) callar();
  };
  useEffect(() => { if (voz && listo) decir(paso.id, paso.texto); }, [voz]); // eslint-disable-line react-hooks/exhaustive-deps

  // Geometría
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const movil = vw < 640;
  const hueco = rect && listo ? {
    top: Math.max(0, rect.top - MARGEN),
    left: Math.max(0, rect.left - MARGEN),
    right: Math.min(vw, rect.left + rect.width + MARGEN),
    bottom: Math.min(vh, rect.top + rect.height + MARGEN),
  } : null;
  const ancho = Math.min(380, vw - 24);
  let pos: CSSProperties | null = null;
  if (hueco && !movil) {
    const alto = 230;
    const left = Math.min(Math.max(12, hueco.left), vw - ancho - 12);
    if (vh - hueco.bottom >= alto) pos = { left, top: hueco.bottom + 12 };
    else if (hueco.top >= alto) pos = { left, bottom: vh - hueco.top + 12 };
    else pos = { left: (vw - ancho) / 2, bottom: 16 };
  }
  const centrado = !paso.objetivo;
  // Pasos 0-3 ocurren en el Tablero y 4-5 dentro del curso: "Atrás" solo dentro de la misma pantalla.
  const zona = (k: number) => (k >= 4 ? 'curso' : 'tablero');
  const anteriorDisponible = i > 0 && zona(i - 1) === zona(i);

  const tarjeta = (
    <div role="dialog" aria-label={paso.titulo} className="recorrido-entrada bg-white text-[#0F172A] rounded-xl shadow-[0_12px_40px_rgba(16,24,40,0.22)] border border-[#E2E8F0] overflow-hidden"
      style={{ width: movil ? '100%' : ancho }}>
      <div className="h-1 bg-[#EFF6FF]"><div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${((i + 1) / PASOS_RECORRIDO.length) * 100}%` }} /></div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">Paso {i + 1} de {PASOS_RECORRIDO.length}</p>
            <h4 className="text-base sm:text-[17px] font-bold leading-snug mt-0.5">{paso.titulo}</h4>
          </div>
          <div className="flex items-center gap-1 -mr-1.5 -mt-1">
            {vozDisponible && (
              <button onClick={alternarVoz} title={voz ? 'Desactivar lectura en voz alta' : 'Escuchar explicación'} aria-pressed={voz}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${voz ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                {voz ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}<span className="hidden sm:inline">{voz ? 'Voz activada' : 'Escuchar'}</span>
              </button>
            )}
            <button onClick={() => terminar(false)} title="Cerrar recorrido" aria-label="Cerrar recorrido" className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F8FAFC]"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <p className="text-sm text-[#334155] leading-relaxed mt-2">{paso.texto}</p>
        {paso.prueba && <p className="mt-2.5 text-sm text-[#1E40AF] bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg px-3 py-2">{paso.prueba}</p>}
        <div className="flex items-center justify-between gap-2 mt-4">
          {i === 0 ? (
            <button onClick={() => terminar(false)} className="px-3 py-2 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]">Ahora no</button>
          ) : anteriorDisponible ? (
            <button onClick={() => ir(i - 1)} className="px-3 py-2 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]">Atrás</button>
          ) : <span />}
          <button onClick={siguiente} className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm">
            {i === 0 ? 'Comenzar' : ultimo ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );

  const sombra = 'absolute pointer-events-auto bg-slate-900/45';
  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" data-tutorial="activo">
      {hueco ? (
        <>
          <div className={sombra} style={{ top: 0, left: 0, right: 0, height: hueco.top }} />
          <div className={sombra} style={{ top: hueco.bottom, left: 0, right: 0, bottom: 0 }} />
          <div className={sombra} style={{ top: hueco.top, left: 0, width: hueco.left, height: hueco.bottom - hueco.top }} />
          <div className={sombra} style={{ top: hueco.top, left: hueco.right, right: 0, height: hueco.bottom - hueco.top }} />
          <div className="absolute rounded-lg pointer-events-none ring-2 ring-[#2563EB] ring-offset-2 ring-offset-white/0 transition-all duration-200"
            style={{ top: hueco.top, left: hueco.left, width: hueco.right - hueco.left, height: hueco.bottom - hueco.top }} />
          {!paso.prueba && (
            <div className="absolute pointer-events-auto" style={{ top: hueco.top, left: hueco.left, width: hueco.right - hueco.left, height: hueco.bottom - hueco.top }} />
          )}
        </>
      ) : (
        <div className="absolute inset-0 pointer-events-auto bg-slate-900/45" />
      )}

      {listo && (centrado ? (
        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
          <div className="pointer-events-auto w-full flex justify-center">{tarjeta}</div>
        </div>
      ) : movil ? (
        <div className="absolute left-3 right-3 pointer-events-auto" style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}>{tarjeta}</div>
      ) : pos && (
        <div className="absolute pointer-events-auto" style={pos}>{tarjeta}</div>
      ))}
      <style>{`
        @keyframes recorridoEntrada { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .recorrido-entrada { animation: recorridoEntrada .2s ease-out both; }
      `}</style>
    </div>
  );
}
