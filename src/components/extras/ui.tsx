// Componentes visuales compartidos por las extensiones (mismo estilo "Canvas" del Aula Virtual)
import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';

type Variante = 'primario' | 'secundario' | 'exito' | 'peligro' | 'fantasma';
const estilos: Record<Variante, string> = {
  primario: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
  secundario: 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]',
  exito: 'bg-[#12805C] hover:bg-[#0E6A4C] text-white',
  peligro: 'bg-[#D92D20] hover:bg-[#B42318] text-white',
  fantasma: 'text-[#64748B] hover:bg-[#F8FAFC]',
};

export function Boton({ variante = 'primario', cargando, className = '', children, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; cargando?: boolean }) {
  return (
    <button {...p} disabled={p.disabled || cargando}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${estilos[variante]} ${className}`}>
      {cargando && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string; key?: string | number }) {
  return <div className={`bg-white border border-[#E2E8F0] rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function Modal({ titulo, onCerrar, children, ancho = 'max-w-lg', icono }:
  { titulo: string; onCerrar: () => void; children: ReactNode; ancho?: string; icono?: ReactNode }) {
  return (
    <div className="modal-capa fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onMouseDown={onCerrar}>
      <div role="dialog" aria-modal aria-label={titulo} onMouseDown={(e) => e.stopPropagation()}
        className={`bg-white rounded-lg border border-[#E2E8F0] shadow-xl w-full ${ancho} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="px-5 py-4 bg-white text-slate-900 border-b border-slate-100 flex justify-between items-center shrink-0 modal-cabecera">
          <div className="flex items-center gap-2.5">{icono}<h3 className="font-bold text-sm">{titulo}</h3></div>
          <button onClick={onCerrar} className="text-slate-300 hover:text-white p-1 rounded hover:bg-[#0F172A]" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Aviso({ tipo = 'info', children }: { tipo?: 'info' | 'error' | 'exito' | 'alerta'; children: ReactNode }) {
  const c = {
    info: 'bg-blue-50 border-blue-200 text-[#0b4f7c]',
    error: 'bg-red-50 border-red-200 text-[#b00404]',
    exito: 'bg-green-50 border-green-200 text-[#00740f]',
    alerta: 'bg-amber-50 border-amber-200 text-amber-900',
  }[tipo];
  return <div className={`px-3.5 py-2.5 border rounded-lg text-xs font-medium ${c}`}>{children}</div>;
}

export function Barra({ valor, color = 'bg-[#2563EB]', className = '' }: { valor: number; color?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className={`h-2 bg-[#E8EBED] rounded-full overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Encabezado({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: string; acciones?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A]">{titulo}</h2>
        {subtitulo && <p className="text-xs text-[#64748B] mt-0.5">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

export const campo = 'w-full bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]';
export const etiqueta = 'block text-xs font-semibold text-[#0F172A] mb-1.5';

// ------------------------------------------------------------------ Avisos flotantes (reemplazan alert())
export type TipoAviso = 'exito' | 'error' | 'aviso' | 'info';
type AvisoFlotante = { id: number; mensaje: string; tipo: TipoAviso };
const EVENTO = 'academia:notificar';

/** Muestra un aviso flotante que se cierra solo. Se puede llamar desde cualquier parte. */
export function notificar(mensaje: string, tipo: TipoAviso = 'aviso') {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { mensaje, tipo } }));
}

const ESTILO_AVISO: Record<TipoAviso, { caja: string; Icono: typeof Info }> = {
  exito: { caja: 'border-emerald-200 bg-emerald-50 text-emerald-900', Icono: CheckCircle2 },
  error: { caja: 'border-red-200 bg-red-50 text-red-900', Icono: XCircle },
  aviso: { caja: 'border-amber-200 bg-amber-50 text-amber-900', Icono: AlertTriangle },
  info: { caja: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]', Icono: Info },
};

export function Notificaciones() {
  const [lista, setLista] = useState<AvisoFlotante[]>([]);
  useEffect(() => {
    const alRecibir = (e: Event) => {
      const { mensaje, tipo } = (e as CustomEvent).detail as { mensaje: string; tipo: TipoAviso };
      const id = Date.now() + Math.random();
      setLista((l) => [...l.slice(-2), { id, mensaje, tipo }]);
      window.setTimeout(() => setLista((l) => l.filter((a) => a.id !== id)), Math.min(9000, 3500 + mensaje.length * 40));
    };
    window.addEventListener(EVENTO, alRecibir);
    return () => window.removeEventListener(EVENTO, alRecibir);
  }, []);
  if (!lista.length) return null;
  return (
    <div className="fixed z-[120] left-3 right-3 sm:left-auto sm:right-4 top-3 sm:top-auto sm:bottom-4 flex flex-col gap-2 sm:w-[380px] pointer-events-none" aria-live="assertive">
      {lista.map(({ id, mensaje, tipo }) => {
        const { caja, Icono } = ESTILO_AVISO[tipo];
        return (
          <div key={id} role="status" className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg text-sm aviso-entrada ${caja}`}>
            <Icono className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="flex-1 leading-snug">{mensaje}</p>
            <button onClick={() => setLista((l) => l.filter((a) => a.id !== id))} className="tactil-compacto p-0.5 rounded opacity-60 hover:opacity-100" aria-label="Cerrar aviso">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
