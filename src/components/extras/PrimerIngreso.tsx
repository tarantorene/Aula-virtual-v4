// Primer ingreso: 1) crear contraseña personal (si es temporal o antigua) 2) aviso de privacidad LOPDP
import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck, LogOut, GraduationCap } from 'lucide-react';
import type { User } from '../../types';
import { hashClave, problemaClave, VERSION_AVISO_PRIVACIDAD } from '../../lib/seguridad';
import { DocumentoAutorizacion, ResumenAutorizacion } from './AutorizacionDatos';
import { useExtras } from '../../lib/extras';
import { Aviso, Boton, campo, etiqueta } from './ui';

export default function PrimerIngreso({ user, onActualizar, onSalir }:
  { user: User; onActualizar: (u: User) => void; onSalir: () => void }) {
  const paso = user.debeCambiarClave ? 1 : 2;
  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#2563EB] text-white rounded-lg flex items-center justify-center"><GraduationCap className="h-6 w-6" /></div>
            <div><h1 className="text-lg font-bold text-[#0F172A] leading-tight">Fundametz</h1><p className="text-xs text-[#64748B]">Bienvenido(a), {user.name.split(' ')[0]}</p></div>
          </div>
          <button onClick={onSalir} className="flex items-center gap-1.5 text-xs font-semibold text-[#D92D20] hover:underline"><LogOut className="h-4 w-4" />Salir</button>
        </div>
        <ol className="flex gap-2 mb-4 text-xs font-semibold">
          {['Crear contraseña', 'Protección de datos'].map((t, i) => (
            <li key={t} className={`flex-1 px-3 py-2.5 rounded-lg border ${paso === i + 1 ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : paso > i + 1 ? 'bg-green-50 text-[#00740f] border-green-200' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}>
              {i + 1}. {t}
            </li>
          ))}
        </ol>
        {paso === 1
          ? <CrearClave user={user} onListo={onActualizar} />
          : <Consentimiento user={user} onListo={onActualizar} />}
      </div>
    </div>
  );
}

export function CrearClave({ user, onListo, textoBoton = 'Guardar y continuar' }:
  { user: User; onListo: (u: User) => void; textoBoton?: string }) {
  const { registrarAuditoria } = useExtras();
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const p = problemaClave(clave, user.email);
    if (p) { setError(p); return; }
    if (clave !== repetir) { setError('Las contraseñas no coinciden.'); return; }
    setEnviando(true);
    const passwordHash = await hashClave(clave);
    registrarAuditoria(user, 'clave.cambiada');
    onListo({ ...user, passwordHash, debeCambiarClave: false });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-sm">
      <KeyRound className="h-9 w-9 text-[#2563EB] mb-3" />
      <h2 className="text-xl font-bold text-[#0F172A]">Crea tu contraseña personal</h2>
      <p className="text-sm text-[#64748B] mt-1.5 mb-5">
        Tu contraseña actual es temporal. Crea una que solo tú conozcas: mínimo 8 caracteres, con letras y números, y sin tu número de cédula.
      </p>
      <form onSubmit={enviar} className="space-y-4">
        <div><label className={etiqueta} htmlFor="c1">Nueva contraseña</label><input id="c1" type="password" autoComplete="new-password" className={campo} value={clave} onChange={(e) => setClave(e.target.value)} required /></div>
        <div><label className={etiqueta} htmlFor="c2">Repite la contraseña</label><input id="c2" type="password" autoComplete="new-password" className={campo} value={repetir} onChange={(e) => setRepetir(e.target.value)} required /></div>
        {error && <Aviso tipo="error">{error}</Aviso>}
        <Boton type="submit" cargando={enviando} className="w-full py-2.5 text-sm">{textoBoton}</Boton>
      </form>
    </div>
  );
}

function Consentimiento({ user, onListo }: { user: User; onListo: (u: User) => void }) {
  const { registrarAuditoria } = useExtras();
  const [acepto, setAcepto] = useState(false);
  const aceptar = () => {
    registrarAuditoria(user, 'consentimiento.aceptado', `Versión ${VERSION_AVISO_PRIVACIDAD}`);
    onListo({ ...user, consentimientoAt: new Date().toISOString(), consentimientoVersion: VERSION_AVISO_PRIVACIDAD });
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 sm:px-7 pt-6 pb-5 bg-gradient-to-b from-[#EFF6FF] to-white border-b border-slate-100">
        <span className="h-11 w-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm"><ShieldCheck className="h-6 w-6" /></span>
        <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">Tus datos personales</h2>
        <p className="mt-1 text-sm text-slate-600">Antes de empezar, lee cómo cuidamos tu información en el Aula Virtual. Lo esencial:</p>
        <div className="mt-4"><ResumenAutorizacion /></div>
      </div>
      <div className="px-5 sm:px-7 py-5">
        <div className="max-h-[42vh] overflow-y-auto pr-1 -mr-1"><DocumentoAutorizacion /></div>
      </div>
      <div className="px-5 sm:px-7 pb-6">
        <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${acepto ? 'bg-[#EFF6FF] border-[#BFDBFE]' : 'border-slate-200 hover:bg-slate-50'}`}>
          <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[#2563EB] shrink-0" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span className="text-sm text-slate-800 leading-snug">
            Yo, <strong>{user.nombreCertificado || user.name}</strong>, con cédula <strong className="tabular-nums">{user.email}</strong>, autorizo a FUNDAMETZ S.A. a tratar mis datos personales para las finalidades descritas.
            <span className="block mt-1 text-xs text-slate-500">Fecha: {new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </span>
        </label>
        <Boton className="w-full mt-4 py-3 text-[15px]" disabled={!acepto} onClick={aceptar}>Autorizar y entrar al Aula Virtual</Boton>
        <p className="mt-3 text-xs text-center text-slate-500">¿Tienes dudas sobre el uso de tus datos? Consulta con Recursos Humanos antes de continuar.</p>
      </div>
    </div>
  );
}

/** Texto del aviso de privacidad (LOPDP), compartido por el primer ingreso y el registro de cuentas. */
export function TextoAvisoPrivacidad() {
  return <DocumentoAutorizacion />;
}
