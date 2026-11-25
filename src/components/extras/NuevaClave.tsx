// Cambio de clave habilitado por Recursos Humanos: en su siguiente ingreso el colaborador
// crea directamente la contraseña que desee (sin clave temporal). La cuenta y el avance se conservan.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import type { User } from '../../types';
import { hashClave, problemaClave } from '../../lib/seguridad';

export const HORAS_CAMBIO_CLAVE = 24;

/** true si RR. HH. habilitó el cambio de clave y el plazo sigue vigente. */
export const cambioClaveVigente = (u?: User | null) =>
  !!u?.cambioClaveHasta && new Date(u.cambioClaveHasta).getTime() > Date.now();

const digitos = (t?: string) => (t ?? '').replace(/\D/g, '');

export default function NuevaClave({ usuario, onGuardar, onVolver }: {
  usuario: User;
  onGuardar: (actualizado: User) => Promise<void> | void;
  onVolver: () => void;
}) {
  const pideCelular = digitos(usuario.telefono).length >= 4;
  const [celular, setCelular] = useState('');
  const [clave, setClave] = useState('');
  const [clave2, setClave2] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const intentosCelular = useState({ n: 0 })[0];

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (pideCelular) {
      if (intentosCelular.n >= 5) { setError('Demasiados intentos. Pide a Recursos Humanos que habilite de nuevo el cambio de clave.'); return; }
      if (digitos(celular) !== digitos(usuario.telefono).slice(-4)) {
        intentosCelular.n++;
        setError('Los últimos 4 dígitos del celular no coinciden con los registrados.');
        return;
      }
    }
    const p = problemaClave(clave, usuario.email);
    if (p) { setError(p); return; }
    if (clave !== clave2) { setError('Las contraseñas no coinciden.'); return; }
    setGuardando(true);
    try {
      await onGuardar({ ...usuario, passwordHash: await hashClave(clave), debeCambiarClave: false, cambioClaveHasta: undefined, solicitudClaveAt: undefined });
    } catch (err) {
      setError(`No se pudo guardar la contraseña. Revisa tu conexión. (${(err as Error)?.message ?? err})`);
      setGuardando(false);
    }
  };

  const ent = 'block w-full px-3.5 py-3 border border-slate-200 rounded-xl text-[15px] bg-white text-slate-900 placeholder-slate-400 outline-none';
  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <button type="button" onClick={onVolver} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 -ml-1 px-1 py-1 rounded-lg">
          <ArrowLeft className="h-4 w-4" />Volver
        </button>
        <span className="mt-3 h-11 w-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center"><KeyRound className="h-6 w-6" /></span>
        <h1 className="mt-3 text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Crea tu nueva contraseña</h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Hola, <strong>{usuario.name.split(' ')[0]}</strong>. Recursos Humanos habilitó el cambio de tu clave. Escribe la contraseña que desees.
        </p>
        <p className="mt-3 flex items-start gap-2 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />Tu cuenta, tu avance y tus certificados se conservan.
        </p>
      </div>

      {pideCelular && (
        <div>
          <label htmlFor="nc-celular" className="block text-sm font-semibold text-slate-800 mb-1.5">Últimos 4 dígitos de tu celular registrado</label>
          <input id="nc-celular" inputMode="numeric" maxLength={4} autoComplete="off" value={celular} onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
            placeholder="0000" className={`${ent} tracking-[0.3em] font-semibold`} />
          <p className="mt-1.5 text-xs text-slate-500">Es para confirmar que eres tú.</p>
        </div>
      )}

      <div>
        <label htmlFor="nc-clave" className="block text-sm font-semibold text-slate-800 mb-1.5">Nueva contraseña</label>
        <div className="relative">
          <input id="nc-clave" type={ver ? 'text' : 'password'} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className={`${ent} pr-12`} />
          <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-1 my-auto h-10 w-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700">
            {ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Mínimo 8 caracteres, con letras y números. No uses tu cédula.</p>
      </div>
      <div>
        <label htmlFor="nc-clave2" className="block text-sm font-semibold text-slate-800 mb-1.5">Repite la contraseña</label>
        <input id="nc-clave2" type={ver ? 'text' : 'password'} autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} className={ent} />
      </div>

      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <button id="btn-guardar-nueva-clave" type="submit" disabled={guardando}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-70">
        {guardando ? <><Loader2 className="h-4 w-4 animate-spin" />Guardando…</> : 'Guardar y entrar'}
      </button>
    </form>
  );
}
