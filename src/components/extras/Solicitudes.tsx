// Solicitudes de cuenta creadas por los propios colaboradores: RR. HH. las aprueba o rechaza.
import { useEffect, useState } from 'react';
import { Briefcase, Check, ChevronDown, Clock, KeyRound, Mail, Phone, RefreshCw, ShieldCheck, Smartphone, Ticket, UserCheck, X } from 'lucide-react';
import type { User } from '../../types';
import { useExtras } from '../../lib/extras';
import { Modal, notificar } from './ui';
import { enviarCorreo } from '../../lib/correo';

// Avisa por correo al colaborador (si registró uno) y cuenta el resultado
const avisarPorCorreo = (tipo: 'cuenta_aprobada' | 'cuenta_rechazada', u: User) => {
  if (!u.correo) return;
  void enviarCorreo(tipo, u.email).then((r) => {
    if (r.estado === 'enviado') notificar(`Se avisó por correo a ${u.name.split(' ')[0]} (${r.destino}).`, 'exito');
    else if (r.estado === 'error') notificar(`No se pudo enviar el correo a ${u.name.split(' ')[0]}.`, 'info');
  });
};

const fecha = (iso?: string) => (iso ? new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const titulo = (t: string) => t.toLowerCase().replace(/(^|\s|\/)\S/g, (c) => c.toUpperCase());

export function SolicitudesCuenta({ users, admin, onActualizar, onRecargar, onRestablecerClave }: {
  users: User[];
  admin: User;
  onActualizar: (u: User) => void;
  onRecargar?: () => Promise<unknown>;
  onRestablecerClave?: (u: User) => void;
}) {
  const { registrarAuditoria } = useExtras();
  const [recargando, setRecargando] = useState(false);
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [verRechazadas, setVerRechazadas] = useState(false);
  const pendientes = users.filter((u) => u.estadoCuenta === 'pendiente').sort((a, b) => (a.solicitadoAt ?? '').localeCompare(b.solicitadoAt ?? ''));
  const rechazadas = users.filter((u) => u.estadoCuenta === 'rechazada');
  const pidenClave = users.filter((u) => u.solicitudClaveAt && u.isActive).sort((a, b) => (a.solicitudClaveAt ?? '').localeCompare(b.solicitudClaveAt ?? ''));
  const total = pendientes.length + pidenClave.length;

  const recargar = async () => {
    if (!onRecargar) return;
    setRecargando(true);
    try { await onRecargar(); } catch { notificar('No se pudieron consultar las solicitudes. Revise la conexión.', 'error'); }
    finally { setRecargando(false); }
  };
  useEffect(() => { void recargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const aprobar = (u: User) => {
    onActualizar({ ...u, isActive: true, estadoCuenta: 'aprobada', revisadoPor: admin.name, revisadoAt: new Date().toISOString(), motivoRechazo: undefined });
    registrarAuditoria(admin, 'cuenta.aprobada', `${u.name} (${u.email})`);
    notificar(`Cuenta de ${u.name} aprobada. Ya puede ingresar con su cédula y su contraseña.`, 'exito');
    avisarPorCorreo('cuenta_aprobada', u);
  };
  const rechazar = (u: User) => {
    const m = motivo.trim();
    onActualizar({ ...u, isActive: false, estadoCuenta: 'rechazada', revisadoPor: admin.name, revisadoAt: new Date().toISOString(), motivoRechazo: m || undefined });
    registrarAuditoria(admin, 'cuenta.rechazada', `${u.name} (${u.email})${m ? ` · ${m}` : ''}`);
    setRechazando(null); setMotivo('');
    notificar(`Solicitud de ${u.name} rechazada.`, 'info');
    avisarPorCorreo('cuenta_rechazada', u);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" aria-labelledby="titulo-solicitudes">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${total ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}><UserCheck className="h-5 w-5" /></span>
          <div>
            <h3 id="titulo-solicitudes" className="text-base font-bold text-slate-900">Solicitudes {total > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs align-middle">{total}</span>}</h3>
            <p className="text-xs text-slate-500">Cuentas nuevas creadas desde la pantalla de inicio y colaboradores que olvidaron su clave.</p>
          </div>
        </div>
        {onRecargar && (
          <button onClick={recargar} disabled={recargando} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-3.5 w-3.5 ${recargando ? 'animate-spin' : ''}`} />Buscar nuevas
          </button>
        )}
      </div>

      {pidenClave.length > 0 && (
        <div className="border-b border-slate-100">
          <p className="px-4 sm:px-5 pt-3 text-xs font-semibold text-slate-500 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" />Olvidaron su clave ({pidenClave.length})</p>
          <ul className="divide-y divide-slate-100">
            {pidenClave.map((u) => (
              <li key={u.id} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-600">Cédula <strong className="tabular-nums">{u.email}</strong>{u.telefono ? <> · <Phone className="inline h-3 w-3" /> {u.telefono}</> : null} · <span className="text-slate-400">pedido {fecha(u.solicitudClaveAt)}</span></p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { onActualizar({ ...u, solicitudClaveAt: undefined }); registrarAuditoria(admin, 'usuario.solicitud_clave_descartada', `${u.name} (${u.email})`); }}
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100">Descartar</button>
                  {onRestablecerClave && (
                    <button id={`btn-restablecer-${u.email}`} onClick={() => onRestablecerClave(u)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm">
                      <KeyRound className="h-4 w-4" />Restablecer clave
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pendientes.length > 0 && <p className="px-4 sm:px-5 pt-3 text-xs font-semibold text-slate-500 flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" />Cuentas nuevas por aprobar ({pendientes.length})</p>}
      {total === 0 ? (
        <p className="px-5 py-5 text-sm text-slate-500">No hay solicitudes pendientes. Aquí aparecerán las cuentas nuevas y los pedidos de clave olvidada.</p>
      ) : pendientes.length === 0 ? null : (
        <ul className="divide-y divide-slate-100">
          {pendientes.map((u) => (
            <li key={u.id} className="px-4 sm:px-5 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900">{u.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>Cédula <strong className="text-slate-800 tabular-nums">{u.email}</strong></span>
                    <span>{u.area ? titulo(u.area) : 'Sin área'}</span>
                    {u.sexo && <span>{u.sexo === 'F' ? 'Mujer' : 'Hombre'}</span>}
                    {u.cargo && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{u.cargo}</span>}
                    {u.telefono && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{u.telefono}</span>}
                    {u.correo && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{u.correo}</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 inline-flex items-center gap-1"><Clock className="h-3 w-3" />Solicitada {fecha(u.solicitadoAt ?? u.createdAt)} · aceptó el aviso de privacidad</p>
                </div>
                {rechazando === u.id ? (
                  <div className="flex flex-col sm:flex-row gap-2 lg:w-[420px]">
                    <input autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional): no labora en la empresa…"
                      className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => { setRechazando(null); setMotivo(''); }} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
                      <button onClick={() => rechazar(u)} className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white">Rechazar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setRechazando(u.id); setMotivo(''); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700 hover:bg-red-50">
                      <X className="h-4 w-4" />Rechazar
                    </button>
                    <button id={`btn-aprobar-${u.email}`} onClick={() => aprobar(u)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm">
                      <Check className="h-4 w-4" />Aprobar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {rechazadas.length > 0 && (
        <div className="border-t border-slate-100">
          <button onClick={() => setVerRechazadas((v) => !v)} className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">
            Solicitudes rechazadas ({rechazadas.length})<ChevronDown className={`h-4 w-4 transition-transform ${verRechazadas ? 'rotate-180' : ''}`} />
          </button>
          {verRechazadas && (
            <ul className="divide-y divide-slate-100 bg-slate-50/50">
              {rechazadas.map((u) => (
                <li key={u.id} className="px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700"><strong>{u.name}</strong> · {u.email}{u.motivoRechazo ? <span className="text-slate-500"> · {u.motivoRechazo}</span> : null}</span>
                  <button onClick={() => aprobar(u)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF]">Aprobar de todos modos</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/** Diálogo para restablecer la clave: el colaborador crea la suya (recomendado) o RR. HH. entrega una temporal. */
export function RestablecerClaveModal({ usuario, horas, onCerrar, onHabilitar, onTemporal }: {
  usuario: User; horas: number; onCerrar: () => void; onHabilitar: () => void; onTemporal: () => void;
}) {
  const tieneCelular = (usuario.telefono ?? '').replace(/\D/g, '').length >= 4;
  return (
    <Modal titulo="Restablecer clave" onCerrar={onCerrar} ancho="max-w-lg" icono={<KeyRound className="h-5 w-5 text-[#2563EB]" />}>
      <p className="text-sm text-slate-600"><strong className="text-slate-900">{usuario.name}</strong> · cédula {usuario.email}</p>
      <p className="mt-3 flex items-start gap-2 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />La cuenta, el avance, las notas, el tiempo de estudio y los certificados se conservan. Solo cambia la clave.
      </p>
      <div className="mt-4 space-y-2.5">
        <button id="btn-habilitar-cambio" onClick={onHabilitar}
          className="w-full text-left rounded-xl border-2 border-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] p-4 transition-colors">
          <span className="flex items-center gap-2 text-[15px] font-bold text-[#1E40AF]"><Smartphone className="h-5 w-5" />Que el trabajador cree su nueva clave<span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2563EB] text-white">Recomendado</span></span>
          <span className="block mt-1 text-sm text-slate-700 leading-snug">
            En su próximo ingreso escribe su cédula y el Aula le pide la contraseña que desee. No hay que entregarle nada. Vale por {horas} horas.
            {tieneCelular ? ' Para confirmar que es él, se le pedirán los últimos 4 dígitos de su celular registrado.' : ' Como no tiene celular registrado, avísele en persona para que lo haga pronto.'}
          </span>
        </button>
        <button id="btn-clave-temporal" onClick={onTemporal}
          className="w-full text-left rounded-xl border border-slate-200 hover:bg-slate-50 p-4 transition-colors">
          <span className="flex items-center gap-2 text-[15px] font-bold text-slate-800"><Ticket className="h-5 w-5" />Entregarle una clave temporal</span>
          <span className="block mt-1 text-sm text-slate-600 leading-snug">El Aula genera una clave que usted le entrega en persona. Al ingresar con ella, crea su propia contraseña.</span>
        </button>
      </div>
      <div className="mt-4 flex justify-end"><button onClick={onCerrar} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button></div>
    </Modal>
  );
}
