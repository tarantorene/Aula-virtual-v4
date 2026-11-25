import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CreditCard, ShieldAlert, GraduationCap, ArrowRight, ClipboardCheck, Smartphone, BadgeCheck, Clock, UserPlus, CheckCircle2 } from 'lucide-react';
import Registro from './extras/Registro';
import NuevaClave, { cambioClaveVigente } from './extras/NuevaClave';
import { User } from '../types';
import { verificarClave } from '../lib/seguridad';
import { useExtras } from '../lib/extras';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User, opciones?: { claveHeredada?: boolean }) => void;
  onRegistrar?: (u: User) => Promise<void> | void;
  recargarUsuarios?: () => Promise<User[] | void>;
  onSolicitarClave?: (cedula: string) => Promise<void>;
  onGuardarClave?: (u: User) => Promise<void>;
}

export default function Login({ users, onLoginSuccess, onRegistrar, recargarUsuarios, onSolicitarClave, onGuardarClave }: LoginProps) {
  const [usuarioCambio, setUsuarioCambio] = useState<User | null>(null);
  const [cedulaOlvido, setCedulaOlvido] = useState('');
  const [estadoOlvido, setEstadoOlvido] = useState<'' | 'enviando' | 'enviado' | 'error'>('');
  // Pedido de clave recordado en este dispositivo para que el colaborador sepa en qué va
  const [pedidoGuardado, setPedidoGuardado] = useState<PedidoClave | null>(() => leerPedido());
  const [estadoPedido, setEstadoPedido] = useState<'' | 'consultando' | 'en-revision' | 'atendido'>('');
  const pedirClave = async () => {
    const ced = (cedulaOlvido || email).trim();
    if (!/^\d{10}$/.test(ced)) { setEstadoOlvido('error'); return; }
    setEstadoOlvido('enviando');
    try { await onSolicitarClave?.(ced); } catch { /* el mensaje es el mismo para no revelar datos */ }
    const pedido = { cedula: ced, fecha: new Date().toISOString() };
    guardarPedido(pedido); setPedidoGuardado(pedido); setEstadoPedido('en-revision');
    setEstadoOlvido('enviado');
  };
  // Consulta si RR. HH. ya habilitó el cambio de clave
  const consultarPedido = async (cedula?: string) => {
    const ced = (cedula || pedidoGuardado?.cedula || email).trim();
    if (!ced) return;
    setEstadoPedido('consultando');
    const lista = (await recargarUsuarios?.().catch(() => undefined)) || users;
    const u = lista.find(x => x.email.trim() === ced);
    if (u?.isActive && cambioClaveVigente(u) && onGuardarClave) {
      setEstadoPedido(''); setUsuarioCambio(u); return;
    }
    // Sin cuenta o con el pedido aún abierto: se muestra "en revisión" (no revela si la cédula existe)
    if (!u || u.solicitudClaveAt) { setEstadoPedido('en-revision'); return; }
    setEstadoPedido('atendido');
  };
  const olvidarPedido = () => { guardarPedido(null); setPedidoGuardado(null); setEstadoPedido(''); };
  const [modo, setModo] = useState<'ingreso' | 'registro'>('ingreso');
  const [aviso, setAviso] = useState<{ tipo: 'pendiente' | 'rechazada'; texto: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const intentos = React.useRef<Record<string, number>>({});
  const { registrarAuditoria } = useExtras();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAviso(null);

    if (!email) {
      setError('Escribe tu número de cédula.');
      return;
    }

    // Lista actualizada: la cuenta pudo aprobarse o restablecerse desde otro dispositivo
    setVerificando(true);
    const lista = (await recargarUsuarios?.().catch(() => undefined)) || users;
    setVerificando(false);
    const coincidencia = lista.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    // RR. HH. habilitó el cambio de clave: el colaborador crea la contraseña que desee
    if (coincidencia?.isActive && cambioClaveVigente(coincidencia) && onGuardarClave) {
      setUsuarioCambio(coincidencia);
      return;
    }

    if (!password && coincidencia?.isActive && coincidencia.solicitudClaveAt) {
      setEstadoPedido('en-revision');
      if (!pedidoGuardado) { const p = { cedula: coincidencia.email, fecha: coincidencia.solicitudClaveAt }; guardarPedido(p); setPedidoGuardado(p); }
      return;
    }
    if (!password) {
      setError('Por favor complete todos los campos.');
      return;
    }
    const enRevision = coincidencia && (coincidencia.estadoCuenta === 'pendiente' || coincidencia.estadoCuenta === 'rechazada');
    const foundUser = coincidencia && (coincidencia.isActive || enRevision) ? coincidencia : undefined;

    // Mensaje genérico: no revela si la cédula existe (buena práctica de seguridad)
    if (!foundUser) {
      setError('Cédula o contraseña incorrecta, o cuenta inactiva.');
      return;
    }

    const clave = email.toLowerCase().trim();
    if ((intentos.current[clave] ?? 0) >= 5) {
      setError('Demasiados intentos fallidos. Espere unos minutos o solicite a Recursos Humanos restablecer su clave.');
      return;
    }

    setVerificando(true);
    const { ok, heredada } = await verificarClave(password, foundUser.passwordHash);
    setVerificando(false);
    if (!ok) {
      intentos.current[clave] = (intentos.current[clave] ?? 0) + 1;
      if (intentos.current[clave] >= 5) {
        registrarAuditoria(foundUser, 'sesion.bloqueo_intentos', '5 intentos fallidos');
        setTimeout(() => { intentos.current[clave] = 0; }, 5 * 60_000);
      }
      setError('Cédula o contraseña incorrecta, o cuenta inactiva.');
      return;
    }

    intentos.current[clave] = 0;
    // Solicitudes de cuenta: solo se informa el estado a quien demostró conocer la contraseña
    if (foundUser.estadoCuenta === 'pendiente') {
      setAviso({ tipo: 'pendiente', texto: 'Tu cuenta está esperando la aprobación de Recursos Humanos. Podrás ingresar apenas sea aprobada.' });
      return;
    }
    if (foundUser.estadoCuenta === 'rechazada') {
      setAviso({ tipo: 'rechazada', texto: `Tu solicitud de cuenta no fue aprobada${foundUser.motivoRechazo ? `: ${foundUser.motivoRechazo}` : '.'} Comunícate con Recursos Humanos.` });
      return;
    }
    if (pedidoGuardado?.cedula === foundUser.email) guardarPedido(null);
    onLoginSuccess(foundUser, { claveHeredada: heredada });
  };

  return (
    <div id="login-screen" className="min-h-screen grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-[#F8FAFC]">
      {/* Panel de marca (solo pantallas grandes) */}
      <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 text-white bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E3A8A]">
        <svg className="absolute -right-24 -bottom-24 h-[520px] w-[520px] opacity-[0.12]" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="100" cy="100" r="44" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25"><GraduationCap className="h-6 w-6" /></div>
          <span className="text-lg font-bold tracking-tight">Fundametz · Aula Virtual</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight">Capacitación para todo el equipo, desde cualquier lugar.</h2>
          <ul className="mt-8 space-y-4 text-[15px] text-blue-50">
            {[
              [ClipboardCheck, 'Tu plan anual de 40 horas del Ministerio del Trabajo'],
              [Smartphone, 'Estudia desde tu celular, tablet o computadora'],
              [BadgeCheck, 'Certificados con código QR verificable'],
            ].map(([Icono, texto]) => {
              const I = Icono as typeof GraduationCap;
              return (
                <li key={texto as string} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><I className="h-5 w-5" /></span>{texto as string}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="relative text-xs text-blue-100/80">Gestión académica y certificaciones · FUNDAMETZ S.A.</p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-11 w-11 bg-[#2563EB] text-white rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3)]"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">Fundametz</p>
              <p className="text-xs text-slate-500">Aula Virtual</p>
            </div>
          </div>
          {usuarioCambio && onGuardarClave ? (
            <NuevaClave usuario={usuarioCambio} onVolver={() => setUsuarioCambio(null)}
              onGuardar={async (u) => { await onGuardarClave(u); guardarPedido(null); onLoginSuccess(u); }} />
          ) : modo === 'registro' && onRegistrar ? (
            <Registro users={users} onRegistrar={onRegistrar} recargarUsuarios={recargarUsuarios}
              onVolver={() => { setModo('ingreso'); setError(''); setAviso(null); }} />
          ) : (<>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">Bienvenido</h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-8">Ingresa con tu número de cédula y tu contraseña.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
            {aviso && (
              <div role="status" className={`p-3.5 text-sm flex items-start gap-2.5 border rounded-xl ${aviso.tipo === 'pendiente' ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {aviso.tipo === 'pendiente' ? <Clock className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
                <span className="font-medium leading-snug">{aviso.texto}</span>
              </div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 text-[#D92D20] text-xs flex items-start gap-2.5 border border-red-200 rounded-lg"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-[#D92D20]" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Número de cédula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="text"
                    autoComplete="off"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 text-[#0F172A] bg-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[15px] rounded-xl transition-colors"
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A]">
                    Contraseña
                  </label>
                  <button type="button" onClick={() => setMostrarAyuda(!mostrarAyuda)} className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 text-[#0F172A] bg-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[15px] rounded-xl transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {pedidoGuardado && (
              <div id="estado-pedido-clave" role="status" className={`p-4 rounded-xl border text-sm space-y-2.5 ${estadoPedido === 'atendido' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                <div className="flex items-start gap-2.5">
                  <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${estadoPedido === 'atendido' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-[15px]">
                      {estadoPedido === 'atendido' ? 'Recursos Humanos ya atendió tu pedido' : 'Tu pedido de clave nueva está en revisión'}
                    </p>
                    <p className="leading-snug mt-0.5">
                      {estadoPedido === 'atendido'
                        ? 'Si te entregaron una clave temporal, escríbela abajo junto a tu cédula. Si no, acércate a Recursos Humanos.'
                        : <>Lo enviaste el {new Date(pedidoGuardado.fecha).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(/\.$/, '')}. Espera a que Recursos Humanos lo habilite y vuelve a consultar.</>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button id="btn-ver-pedido" type="button" onClick={() => consultarPedido()} disabled={estadoPedido === 'consultando'}
                    className="px-3.5 py-2 rounded-lg bg-white border border-current/20 font-semibold hover:bg-white/70 disabled:opacity-70">
                    {estadoPedido === 'consultando' ? 'Consultando…' : 'Ver si ya está lista'}
                  </button>
                  <button type="button" onClick={olvidarPedido} className="px-3 py-2 rounded-lg font-medium opacity-80 hover:opacity-100">Ocultar</button>
                </div>
              </div>
            )}

            {mostrarAyuda && (
              <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm text-[#1E3A8A] space-y-3" role="region" aria-label="Recuperar acceso">
                {estadoOlvido === 'enviado' ? (
                  <>
                    <p className="font-bold text-[15px] flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Pedido enviado</p>
                    <p className="leading-snug">Si la cédula está registrada, Recursos Humanos ya ve tu pedido en su lista de <strong>Solicitudes</strong>.</p>
                    <ol className="space-y-2">
                      <li className="flex gap-2.5"><span className="h-5 w-5 shrink-0 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center">1</span><span><strong>Espera</strong> a que Recursos Humanos lo revise (en horario de oficina). Te llegará un <strong>correo</strong> cuando esté listo.</span></li>
                      <li className="flex gap-2.5"><span className="h-5 w-5 shrink-0 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center">2</span><span>Vuelve a esta pantalla y pulsa <strong>Ver si ya está lista</strong> (o escribe tu cédula y pulsa <strong>Ingresar</strong>).</span></li>
                      <li className="flex gap-2.5"><span className="h-5 w-5 shrink-0 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center">3</span><span>Cuando esté habilitado, se abrirá la pantalla para <strong>crear tu nueva contraseña</strong>.</span></li>
                    </ol>
                    <p className="leading-snug"><strong>No pierdes nada:</strong> tu cuenta, tu avance y tus certificados se conservan.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-[15px]">Recupera tu acceso</p>
                    <p className="leading-snug">Escribe tu cédula y Recursos Humanos te dará una clave temporal. Tu cuenta y tu avance se conservan.</p>
                    {onSolicitarClave ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input id="cedula-olvido" inputMode="numeric" maxLength={10} value={cedulaOlvido || email}
                          onChange={(e) => { setCedulaOlvido(e.target.value.replace(/\D/g, '')); setEstadoOlvido(''); }}
                          placeholder="Tu número de cédula" className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#BFDBFE] bg-white text-[15px] text-slate-900" />
                        <button id="btn-pedir-clave" type="button" onClick={pedirClave} disabled={estadoOlvido === 'enviando'}
                          className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold disabled:opacity-70">
                          {estadoOlvido === 'enviando' ? 'Enviando…' : 'Pedir clave nueva'}
                        </button>
                      </div>
                    ) : (
                      <p>Acércate a Recursos Humanos para que restablezcan tu clave.</p>
                    )}
                    {estadoOlvido === 'error' && <p className="text-xs font-medium text-red-600">Escribe tu número de cédula (10 dígitos).</p>}
                  </>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                id="btn-submit-login"
                type="submit"
                disabled={verificando}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors rounded-xl cursor-pointer shadow-[0_8px_20px_rgba(37,99,235,0.25)]"
              >
                {verificando ? 'Verificando…' : 'Ingresar'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>


          {onRegistrar && (
            <div className="mt-6">
              <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />¿No tienes cuenta?<span className="h-px flex-1 bg-slate-200" /></div>
              <button id="btn-crear-cuenta" type="button" onClick={() => { setModo('registro'); setError(''); setAviso(null); }}
                className="mt-4 w-full flex justify-center items-center gap-2 py-3 px-4 text-[15px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl transition-colors">
                <UserPlus className="h-4 w-4" />Crear mi cuenta
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left">
              <strong className="text-slate-800">¿Te dieron una clave temporal?</strong> Ingresa con ella; luego crearás tu contraseña personal.
            </p>
            <a href="?verificar=" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"><BadgeCheck className="h-4 w-4" />Verificar un certificado</a>
          </div>
          </>)}
        </motion.div>
      </main>
    </div>
  );
}

// --- Pedido de clave nueva recordado en este dispositivo ---
type PedidoClave = { cedula: string; fecha: string };
const CLAVE_PEDIDO = 'academia_pedido_clave';
function leerPedido(): PedidoClave | null {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE_PEDIDO) || 'null');
    // Se descarta pasados 7 días
    if (p && Date.now() - new Date(p.fecha).getTime() < 7 * 86400_000) return p;
  } catch { /* sin almacenamiento */ }
  return null;
}
function guardarPedido(p: PedidoClave | null) {
  try { p ? localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(p)) : localStorage.removeItem(CLAVE_PEDIDO); } catch { /* sin almacenamiento */ }
}
