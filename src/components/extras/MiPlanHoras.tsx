// Tarjeta del colaborador: avance en el plan anual de 40 horas y certificado de cumplimiento
import { useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Clock, Presentation, Target } from 'lucide-react';
import type { CertificateTemplate, QuizAttempt, Topic, User, UserProgress } from '../../types';
import { useExtras } from '../../lib/extras';
import { fmtHoras, fmtMinutos, resumenHoras } from '../../lib/cumplimiento';
import { generarCertificadoPlan } from '../../lib/certificadoExtras';
import { Boton } from './ui';
import ConfirmarNombre, { type ModoCertificado } from './ConfirmarNombre';

export default function MiPlanHoras({ user, topics, progress, certificateTemplates, onAbrirCurso, onGuardarNombre }:
  { user: User; topics: Topic[]; progress: UserProgress[]; attempts: QuizAttempt[]; certificateTemplates: CertificateTemplate[]; onAbrirCurso: (id: string) => void; onGuardarNombre?: (nombre: string) => void }) {
  const { tiempos, sesiones, config, emitirCertificado, registrarAuditoria, respuestas } = useExtras();
  const [confirmando, setConfirmando] = useState(false);
  const r = resumenHoras(user, topics, progress, tiempos, sesiones, config, respuestas);
  if (r.cursos.length === 0) return null;

  const descargar = async (nombre: string, modo: ModoCertificado) => {
    if (nombre !== (user.nombreCertificado || user.name)) onGuardarNombre?.(nombre);
    {
      const plantilla = certificateTemplates.find((t) => t.isActive) || certificateTemplates[0];
      const cert = emitirCertificado({
        userId: user.id, userName: nombre, cedula: user.email, topicId: `PLAN-${config.anio}`,
        titulo: config.nombrePlan, horas: r.total,
      });
      registrarAuditoria(user, 'certificado.emitido', `${cert.codigo} · ${config.nombrePlan}`);
      await generarCertificadoPlan({
        nombre, modo, cedula: user.email, plan: config.nombrePlan, horas: r.total,
        virtuales: r.virtuales, presenciales: r.presenciales, codigo: cert.codigo,
        cursos: r.cursos.map((c) => c.topic.title.replace(/^Igualdad \d+:\s*/, '')),
        firmaNombre: plantilla?.signatureName || 'Recursos Humanos', firmaCargo: plantilla?.signatureRole || 'Jefe de Recursos Humanos',
      });
    }
    setConfirmando(false);
  };

  const siguiente = r.cursos.find((c) => !c.acreditado);

  const pct = Math.min(100, Math.round((r.total / Math.max(1, r.minimas)) * 100));
  const R = 42, C = 2 * Math.PI * R;
  const acreditados = r.cursos.filter((c) => c.acreditado).length;

  return (
    <div id="tour-plan" className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
      {confirmando && <ConfirmarNombre nombreActual={user.nombreCertificado || user.name} titulo={`${config.nombrePlan} (${fmtHoras(r.total)})`}
        onCerrar={() => setConfirmando(false)} onConfirmar={descargar} />}

      {/* Progreso del plan con anillo */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-5">
        <div className="relative shrink-0 h-[104px] w-[104px]">
          <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="52" cy="52" r={R} fill="none" stroke="#E2E8F0" strokeWidth="10" />
            {pct > 0 && <circle cx="52" cy="52" r={R} fill="none" stroke={r.completo ? '#16A34A' : '#2563EB'} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * C} ${C}`} className="transition-all duration-700" />}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900 leading-none">{fmtHoras(r.total)}</span>
            <span className="text-[11px] text-slate-500 mt-0.5">de {fmtHoras(r.minimas)}</span>
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold text-[#2563EB] flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />{config.nombrePlan}</p>
          <p className="text-sm text-slate-600 leading-snug">{r.completo ? '¡Completaste tu plan! Ya puedes descargar tu certificado.' : `Llevas ${pct} % de tu plan de capacitación.`}</p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" />{acreditados}/{r.cursos.length} cursos</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600"><Presentation className="h-3 w-3" />{fmtHoras(r.presenciales)} presenciales</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600"><Clock className="h-3 w-3" />{fmtMinutos(r.segundosEstudio)}</span>
          </div>
        </div>
      </div>

      {/* Siguiente paso / certificado */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-4">
        {r.completo ? (
          <>
            <div>
              <span className="inline-flex px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Plan completo</span>
              <p className="mt-2 text-base font-bold text-slate-900">Tu certificado de {fmtHoras(r.minimas)} está listo</p>
              <p className="text-sm text-slate-500">Incluye código de verificación y QR.</p>
            </div>
            <Boton onClick={() => setConfirmando(true)} className="self-start px-5 py-2.5"><Award className="h-4 w-4" />Descargar certificado</Boton>
          </>
        ) : siguiente ? (
          <>
            <div className="min-w-0">
              <span className="inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">{siguiente.aprobado ? 'Falta tiempo de estudio' : 'Siguiente paso'}</span>
              <p className="mt-2 text-base font-bold text-slate-900 leading-snug">{siguiente.topic.title}</p>
              <p className="text-sm text-slate-500">{!siguiente.aprobado ? 'Completa las lecturas, las actividades y aprueba la evaluación final.' : `Te faltan ${Math.max(0, Math.ceil(siguiente.minutosMinimos - siguiente.segundos / 60))} min de estudio en este curso.`}</p>
            </div>
            <Boton onClick={() => onAbrirCurso(siguiente.topic.id)} className="self-start px-5 py-2.5">Continuar curso <ArrowRight className="h-4 w-4" /></Boton>
          </>
        ) : null}
      </div>
    </div>
  );
}
