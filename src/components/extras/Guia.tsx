// Guía de bienvenida (6 pasos + preguntas frecuentes + móvil/computadora) y recorrido guiado en pantalla
import { useEffect, useLayoutEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Compass, HelpCircle, MonitorSmartphone, Sparkles, X } from 'lucide-react';
import type { User } from '../../types';

const CLAVE_VISTA = (id: string) => `academia_guia_vista_${id}`;
export const guiaYaVista = (id: string) => { try { return localStorage.getItem(CLAVE_VISTA(id)) === '1'; } catch { return true; } };

const PASOS = [
  {
    titulo: 'Tu tablero y tu plan de capacitación',
    sub: 'Avanza a tu ritmo hasta completar las horas del plan anual.',
    puntos: [
      ['Cursos asignados', 'En el Tablero ves los cursos de tu área. Usa las pestañas Todos, Pendientes y Aprobados para ubicarte.'],
      ['Plan de 40 horas', 'La tarjeta azul muestra tus horas acumuladas (virtuales y presenciales) y el siguiente paso que te falta.'],
      ['Tu avance se guarda solo', 'Puedes salir y volver cuando quieras, desde el celular o la computadora.'],
    ],
  },
  {
    titulo: 'Video principal obligatorio',
    sub: 'Algunos cursos inician con una clase en video que debes ver primero.',
    puntos: [
      ['Clase principal', 'Si el curso lo exige, las lecturas, actividades y la prueba se desbloquean al terminar el primer video.'],
      ['Material complementario', 'Los demás videos aparecen en orden dentro del plan de aprendizaje.'],
      ['Marca tu avance', 'Al terminar el video, pulsa el botón para registrar tu avance.'],
    ],
  },
  {
    titulo: 'Lecturas, ejemplos y material de apoyo',
    sub: 'Contenidos pensados para la realidad de la planta, la bodega y las oficinas.',
    puntos: [
      ['Plan de aprendizaje', 'El índice muestra todas las lecciones con un visto verde en las que ya completaste.'],
      ['Ejemplos prácticos', 'Los recuadros amarillos presentan casos reales de trabajo en Fundametz.'],
      ['Documentos de apoyo', 'Debajo de cada lectura puedes ver guías en PDF con vista previa y enlaces a la normativa oficial.'],
    ],
  },
  {
    titulo: 'Actividades prácticas',
    sub: 'Responde por escrito para sumar puntos a la nota del módulo.',
    puntos: [
      ['Cómo responder', 'Lee la consigna y los criterios, escribe tu respuesta y pulsa "Enviar y acreditar".'],
      ['Puedes mejorarla', 'Tu respuesta queda guardada y puedes editarla cuando quieras.'],
      ['Revisión', 'Recursos Humanos puede revisarla, ajustar el puntaje y dejarte un comentario.'],
    ],
  },
  {
    titulo: 'Prueba final y nota del módulo',
    sub: 'Calificación inmediata con retroalimentación.',
    puntos: [
      ['Nota del módulo', 'Cuando hay actividades, la nota se compone de sus puntos más la prueba final (por ejemplo 40 + 60 = 100).'],
      ['Si no apruebas', 'Verás qué preguntas fallaste, sin revelar la respuesta, para que repases antes del siguiente intento.'],
      ['Tiempo de estudio', 'El aula registra tu tiempo efectivo de estudio; algunos cursos piden un mínimo para acreditar las horas.'],
    ],
  },
  {
    titulo: 'Certificados',
    sub: 'Confirma tu nombre completo y descarga o imprime tu certificado.',
    puntos: [
      ['Nombre correcto', 'Antes de emitirlo confirmas tus nombres y apellidos completos (puedes corregirlos después).'],
      ['Descargar o imprimir', 'Obtén el PDF o ábrelo listo para imprimir. Cada certificado tiene un código y un QR de verificación.'],
      ['Certificado de 40 horas', 'Al completar el plan anual se habilita el certificado de cumplimiento en la tarjeta azul del Tablero.'],
    ],
  },
];

const FAQ = [
  ['¿Qué nota necesito para aprobar?', 'Depende del curso: se indica en la tarjeta "Nota del módulo" o en la prueba final. Si el curso tiene actividades, suelen requerirse 70 puntos sobre 100.'],
  ['¿Por qué no puedo abrir una lectura o rendir la prueba?', 'Si el curso tiene video obligatorio, primero termina la clase principal. Para la prueba final también debes completar todas las lecturas y, si existen, enviar las actividades.'],
  ['¿Qué pasa si repruebo la prueba final?', 'Puedes volver a intentarlo hasta el límite de intentos del curso. Verás qué preguntas fallaste para repasar esos temas.'],
  ['¿Cómo corrijo mi nombre en el certificado?', 'Al descargarlo aparece la confirmación de nombres; usa "Corregir nombres" y vuelve a descargarlo.'],
  ['¿Cómo sé que mi certificado es válido?', 'Escanea el QR del certificado o ingresa su código en "Verificar un certificado" en la pantalla de ingreso.'],
  ['Olvidé mi contraseña', 'Pide a Recursos Humanos que la restablezca. Recibirás una clave temporal y crearás una nueva al ingresar.'],
];

export function GuiaBienvenida({ user, onCerrar, onIniciarTour, onAbrirManual }:
  { user: User; onCerrar: () => void; onIniciarTour: () => void; onAbrirManual: () => void }) {
  const [tab, setTab] = useState<'pasos' | 'dispositivos' | 'faq'>('pasos');
  const [paso, setPaso] = useState(0);
  const [noMostrar, setNoMostrar] = useState(true);
  const cerrar = () => { try { if (noMostrar) localStorage.setItem(CLAVE_VISTA(user.id), '1'); } catch { /* sin almacenamiento */ } onCerrar(); };
  const p = PASOS[paso];

  return (
    <div className="modal-capa fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/50" onMouseDown={cerrar}>
      <div role="dialog" aria-modal aria-label="Guía de uso del Aula Virtual" onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 flex items-start gap-3 border-b border-[#E0E0E0]">
          <div className="h-10 w-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0"><Compass className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Guía de bienvenida · Fundametz</p>
            <h2 className="text-lg font-bold text-[#0F172A] leading-tight">¿Cómo usar el Aula Virtual, {user.name.split(' ')[0]}?</h2>
          </div>
          <button onClick={cerrar} className="p-1.5 rounded hover:bg-[#F8FAFC] text-[#64748B]" aria-label="Cerrar guía"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-1 px-4 border-b border-[#E0E0E0] overflow-x-auto">
          {([['pasos', 'Paso a paso (6)', Compass], ['dispositivos', 'Celular y computadora', MonitorSmartphone], ['faq', 'Preguntas frecuentes', HelpCircle]] as const).map(([id, txt, Ic]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 ${tab === id ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'}`}>
              <Ic className="h-4 w-4" />{txt}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'pasos' && (
            <div>
              <div className="flex items-center gap-1.5 mb-4">
                {PASOS.map((_, i) => <button key={i} onClick={() => setPaso(i)} aria-label={`Paso ${i + 1}`} className={`h-1.5 flex-1 rounded-full ${i <= paso ? 'bg-[#2563EB]' : 'bg-[#E0E0E0]'}`} />)}
                <span className="ml-2 text-[11px] font-mono text-[#64748B] whitespace-nowrap">Paso {paso + 1} de {PASOS.length}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Paso {String(paso + 1).padStart(2, '0')}</p>
              <h3 className="text-xl font-bold text-[#0F172A]">{p.titulo}</h3>
              <p className="text-sm text-[#64748B] mb-4">{p.sub}</p>
              <div className="space-y-2.5">
                {p.puntos.map(([t, d]) => (
                  <div key={t} className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E0E0E0]">
                    <p className="text-sm font-bold text-[#2563EB]">{t}</p>
                    <p className="text-sm text-[#0F172A] mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'dispositivos' && (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ['En computadora', ['Menú lateral izquierdo: Tablero, Calendario y Bandeja.', 'Índice completo del curso con vistos verdes.', 'Vista previa de PDF y videos en pantalla completa.']],
                ['En celular', ['Menú inferior para moverte entre secciones.', 'Botones "Anterior" y "Siguiente" al final de cada lectura.', 'Gira el teléfono para ver los videos más grandes.']],
              ].map(([t, items]) => (
                <div key={t as string} className="p-4 rounded-lg border border-[#E0E0E0]">
                  <p className="font-bold text-[#0F172A] mb-2">{t as string}</p>
                  <ul className="space-y-1.5 text-[#64748B]">{(items as string[]).map((x) => <li key={x}>• {x}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {tab === 'faq' && (
            <div className="space-y-3">
              {FAQ.map(([q, a]) => (
                <div key={q}><p className="text-sm font-bold text-[#0F172A]">{q}</p><p className="text-sm text-[#64748B] mt-0.5">{a}</p></div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#E0E0E0] bg-[#F8FAFC] flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[#64748B] mr-auto cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#2563EB]" checked={noMostrar} onChange={(e) => setNoMostrar(e.target.checked)} />
            Entendido, no volver a mostrar automáticamente
          </label>
          <button onClick={onAbrirManual} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:border-[#2563EB]"><BookOpen className="h-4 w-4" />Manual completo</button>
          <button onClick={() => { cerrar(); onIniciarTour(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EFF6FF] text-xs font-semibold text-[#2563EB] hover:bg-[#DBEAFE]"><Sparkles className="h-4 w-4" />Recorrido guiado</button>
          {tab === 'pasos' && (
            <>
              <button disabled={paso === 0} onClick={() => setPaso(paso - 1)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-[#64748B] disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
              {paso < PASOS.length - 1
                ? <button onClick={() => setPaso(paso + 1)} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold">Siguiente<ChevronRight className="h-4 w-4" /></button>
                : <button onClick={cerrar} className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold">Empezar</button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Recorrido guiado
const PASOS_TOUR = [
  { id: 'tour-plan', titulo: 'Tu plan de 40 horas', texto: 'Aquí ves tus horas acumuladas, los cursos acreditados y el siguiente paso. Cuando completes el plan aparecerá el botón del certificado.' },
  { id: 'tour-pestanas', titulo: 'Filtra tus cursos', texto: 'Cambia entre todos tus cursos, los pendientes y los aprobados.' },
  { id: 'tour-cursos', titulo: 'Tus cursos asignados', texto: 'Pulsa "Iniciar" o "Continuar" en un curso para abrir sus lecturas, videos, actividades y la prueba final.' },
  { id: 'tour-por-hacer', titulo: 'Por hacer', texto: 'La lista de cursos que aún tienes pendientes, con la nota mínima que necesitas.' },
  { id: 'tour-calendario', titulo: 'Calendario y bandeja', texto: 'Consulta las fechas límite de tus cursos y los mensajes de Recursos Humanos.' },
  { id: 'tour-cuenta', titulo: 'Tu cuenta', texto: 'Revisa tu perfil, cambia tu contraseña o vuelve a abrir esta guía cuando la necesites.' },
];

export function TourPantalla({ onTerminar }: { onTerminar: () => void }) {
  const pasos = PASOS_TOUR.filter((p) => {
    const el = document.getElementById(p.id);
    return el && el.getBoundingClientRect().width > 0;
  });
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const paso = pasos[i];

  useLayoutEffect(() => {
    if (!paso) return;
    const el = document.getElementById(paso.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const medir = () => setRect(document.getElementById(paso.id)?.getBoundingClientRect() ?? null);
    const t = window.setTimeout(medir, 350);
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', medir); window.removeEventListener('scroll', medir, true); };
  }, [paso]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onTerminar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onTerminar]);

  useEffect(() => { if (!paso) onTerminar(); }, [paso, onTerminar]);
  if (!paso) return null;
  const m = 6;
  const abajo = rect ? rect.bottom + 190 < window.innerHeight : true;
  const izquierda = rect ? Math.min(Math.max(12, rect.left), window.innerWidth - 332) : 12;

  return (
    <div className="fixed inset-0 z-[70]" aria-live="polite">
      {rect && (
        <div className="absolute rounded-xl ring-4 ring-amber-400 pointer-events-none transition-all duration-300"
          style={{ top: rect.top - m, left: rect.left - m, width: rect.width + m * 2, height: rect.height + m * 2, boxShadow: '0 0 0 9999px rgba(15,23,42,0.6)' }} />
      )}
      {rect && (
        <div className="absolute w-80 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] p-4 transition-all duration-300"
          style={{ left: izquierda, top: abajo ? rect.bottom + m + 10 : undefined, bottom: abajo ? undefined : window.innerHeight - rect.top + m + 10 }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Recorrido · {i + 1} de {pasos.length}</p>
          <h4 className="text-base font-bold text-[#0F172A] mt-0.5">{paso.titulo}</h4>
          <p className="text-sm text-[#64748B] mt-1">{paso.texto}</p>
          <div className="flex items-center justify-between mt-3">
            <button onClick={onTerminar} className="text-xs font-semibold text-[#64748B] hover:underline">Saltar</button>
            <div className="flex gap-1.5">
              {i > 0 && <button onClick={() => setI(i - 1)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC]">Anterior</button>}
              <button onClick={() => (i < pasos.length - 1 ? setI(i + 1) : onTerminar())} className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold">
                {i < pasos.length - 1 ? 'Siguiente' : 'Terminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
