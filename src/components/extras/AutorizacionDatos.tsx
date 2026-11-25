// Autorización para el tratamiento de datos personales (LOPDP), presentada en forma clara:
// resumen de tres puntos, documento completo por secciones y casilla de autorización personalizada.
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Building2, CalendarClock, Eye, FileText, Gavel, Lock, Scale, ShieldCheck, Target, Timer, UserCheck, Users,
} from 'lucide-react';
import { VERSION_AVISO_PRIVACIDAD } from '../../lib/seguridad';
import { Modal } from './ui';

type Seccion = { Icono: typeof FileText; titulo: string; contenido: ReactNode };

export const SECCIONES_AUTORIZACION: Seccion[] = [
  { Icono: Building2, titulo: 'Responsable del tratamiento',
    contenido: <>FUNDAMETZ S.A., a través de su área de <strong>Recursos Humanos</strong>, que administra el Aula Virtual.</> },
  { Icono: Target, titulo: 'Para qué usamos tus datos',
    contenido: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Crear y administrar tu cuenta en el Aula Virtual.</li>
        <li>Registrar tu avance, tus evaluaciones y tus horas de capacitación.</li>
        <li>Emitir tus certificados con código de verificación.</li>
        <li>Enviarte por correo avisos sobre tu cuenta y tu contraseña.</li>
        <li>Demostrar ante el Ministerio del Trabajo el cumplimiento de la capacitación obligatoria (Acuerdo MDT-2025-006).</li>
      </ul>
    ) },
  { Icono: FileText, titulo: 'Qué datos tratamos',
    contenido: (
      <div className="grid sm:grid-cols-2 gap-2">
        <Chip titulo="Identificación">cédula, nombres y apellidos</Chip>
        <Chip titulo="Trabajo">área y sexo (solo para estadísticas de igualdad, sin nombres)</Chip>
        <Chip titulo="Contacto">correo electrónico (para avisos de tu cuenta y tu clave) y celular (para confirmar tu identidad al cambiar la clave)</Chip>
        <Chip titulo="Capacitación">avance, tiempo de estudio, evaluaciones, actividades, asistencia y certificados</Chip>
      </div>
    ) },
  { Icono: Timer, titulo: 'Registro del tiempo de estudio',
    contenido: <>Mientras tienes una lección abierta y activa, el Aula registra los minutos de estudio como evidencia de tu capacitación. No se registra nada fuera del Aula.</> },
  { Icono: Scale, titulo: 'Base legal',
    contenido: <>Tu autorización y el cumplimiento de obligaciones legales del empleador derivadas de la relación laboral.</> },
  { Icono: Users, titulo: 'Quién puede ver tus datos',
    contenido: <>Solo Recursos Humanos y los administradores del Aula. La información de cumplimiento se presenta al Ministerio del Trabajo cuando la normativa lo exige. <strong>No vendemos ni compartimos tus datos con fines comerciales.</strong></> },
  { Icono: Lock, titulo: 'Cómo los protegemos',
    contenido: <>Tu contraseña se guarda cifrada y nadie puede verla, ni siquiera Recursos Humanos. Las consultas, exportaciones y cambios quedan registrados en una bitácora de auditoría.</> },
  { Icono: CalendarClock, titulo: 'Cuánto tiempo los conservamos',
    contenido: <>Mientras dure tu relación laboral y el tiempo adicional que exija la normativa para fines de control.</> },
  { Icono: UserCheck, titulo: 'Tus derechos',
    contenido: (
      <>
        <div className="flex flex-wrap gap-1.5">
          {['Acceso', 'Rectificación y actualización', 'Eliminación', 'Oposición', 'Portabilidad', 'Suspensión del tratamiento'].map((d) => (
            <span key={d} className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-semibold">{d}</span>
          ))}
        </div>
        <p className="mt-2">Puedes ejercerlos en cualquier momento con una solicitud a Recursos Humanos. También puedes retirar esta autorización, sin efecto sobre el tratamiento ya realizado.</p>
      </>
    ) },
  { Icono: Gavel, titulo: 'Si no estás conforme',
    contenido: <>Si consideras que tus derechos no fueron atendidos, puedes presentar un reclamo ante la Superintendencia de Protección de Datos Personales.</> },
];

function Chip({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
      <p className="text-[11px] font-semibold text-slate-500">{titulo}</p>
      <p className="text-[13px] text-slate-800 leading-snug">{children}</p>
    </div>
  );
}

/** Lo esencial en tres puntos, para leer de un vistazo. */
export function ResumenAutorizacion() {
  const puntos = [
    { Icono: Target, titulo: 'Para qué', texto: 'Tu capacitación, tus horas y tus certificados.' },
    { Icono: Eye, titulo: 'Quién los ve', texto: 'Solo Recursos Humanos. No se venden ni se comparten.' },
    { Icono: UserCheck, titulo: 'Tus derechos', texto: 'Puedes consultarlos, corregirlos o pedir su eliminación.' },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-2.5">
      {puntos.map(({ Icono, titulo, texto }) => (
        <div key={titulo} className="rounded-xl border border-slate-200 bg-white p-3.5 flex sm:flex-col gap-3 sm:gap-2">
          <span className="h-9 w-9 shrink-0 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center"><Icono className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-bold text-slate-900">{titulo}</p>
            <p className="text-[13px] text-slate-600 leading-snug">{texto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Documento completo, por secciones numeradas. */
export function DocumentoAutorizacion() {
  return (
    <article className="text-[14px] leading-relaxed text-slate-700">
      <header className="flex items-start gap-3 pb-4 mb-4 border-b border-slate-200">
        <span className="h-10 w-10 shrink-0 rounded-xl bg-[#2563EB] text-white flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <p className="text-base font-bold text-slate-900 leading-snug">Autorización para el tratamiento de datos personales</p>
          <p className="text-xs text-slate-500">FUNDAMETZ S.A. · Ley Orgánica de Protección de Datos Personales · Versión {VERSION_AVISO_PRIVACIDAD}</p>
        </div>
      </header>
      <ol className="space-y-4">
        {SECCIONES_AUTORIZACION.map(({ Icono, titulo, contenido }, i) => (
          <li key={titulo} className="flex gap-3">
            <span className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Icono className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-slate-900"><span className="text-slate-400 font-semibold mr-1.5">{i + 1}.</span>{titulo}</p>
              <div className="mt-1">{contenido}</div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

/** Casilla de autorización con resumen y acceso al documento completo. */
export function TarjetaAutorizacion({ acepto, onCambiar, error, nombre, cedula, id = 'autorizacion-datos' }: {
  acepto: boolean; onCambiar: (v: boolean) => void; error?: string; nombre?: string; cedula?: string; id?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const hoy = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section aria-labelledby={`${id}-titulo`} className={`rounded-2xl border bg-white overflow-hidden ${error ? 'border-red-300' : 'border-slate-200'}`}>
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <span className="h-10 w-10 shrink-0 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></span>
        <div className="min-w-0">
          <h3 id={`${id}-titulo`} className="text-[15px] font-bold text-slate-900 leading-snug">Autorización de tratamiento de datos personales</h3>
          <p className="text-xs text-slate-500">Ley Orgánica de Protección de Datos Personales · versión {VERSION_AVISO_PRIVACIDAD}</p>
        </div>
      </div>
      <div className="px-4 pb-3"><ResumenAutorizacion /></div>
      <div className="px-4 pb-4">
        <button type="button" onClick={() => setAbierto(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF]">
          <FileText className="h-4 w-4" />Leer la autorización completa
        </button>
      </div>
      <label className={`flex items-start gap-3 px-4 py-4 border-t cursor-pointer transition-colors ${acepto ? 'bg-[#EFF6FF] border-[#BFDBFE]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'}`}>
        <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 accent-[#2563EB] shrink-0" checked={acepto} onChange={(e) => onCambiar(e.target.checked)} />
        <span className="text-sm text-slate-800 leading-snug">
          {nombre ? <>Yo, <strong>{nombre}</strong>{cedula ? <>, con cédula <strong className="tabular-nums">{cedula}</strong>,</> : ','} autorizo</> : 'Autorizo'} a FUNDAMETZ S.A. a tratar mis datos personales para las finalidades descritas en esta autorización.
          <span className="block mt-1 text-xs text-slate-500">Fecha: {hoy}</span>
        </span>
      </label>
      {error && <p className="px-4 pb-3 pt-1 text-xs font-medium text-red-600 bg-slate-50">{error}</p>}

      {abierto && (
        <Modal titulo="Autorización de datos personales" ancho="max-w-2xl" onCerrar={() => setAbierto(false)} icono={<ShieldCheck className="h-5 w-5 text-[#2563EB]" />}>
          <DocumentoAutorizacion />
          <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 px-5 py-3 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cerrar</button>
            <button type="button" onClick={() => { onCambiar(true); setAbierto(false); }}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold">He leído y autorizo</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
