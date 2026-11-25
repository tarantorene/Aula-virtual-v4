// Registro de cuenta por el propio colaborador. La cuenta queda "pendiente" e inactiva
// hasta que Recursos Humanos la apruebe en Gestión de Cuentas.
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { CORPORATE_AREAS, type User } from '../../types';
import { cedulaValida, hashClave, problemaClave, VERSION_AVISO_PRIVACIDAD } from '../../lib/seguridad';
import { TarjetaAutorizacion } from './AutorizacionDatos';

type Datos = {
  cedula: string; nombres: string; apellidos: string; sexo: '' | 'M' | 'F'; area: string;
  telefono: string; correo: string; clave: string; clave2: string; acepto: boolean;
};
const VACIO: Datos = { cedula: '', nombres: '', apellidos: '', sexo: '', area: '', telefono: '', correo: '', clave: '', clave2: '', acepto: false };

const titulo = (t: string) => t.trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function validarRegistro(d: Datos, existentes: User[]): Partial<Record<keyof Datos, string>> {
  const e: Partial<Record<keyof Datos, string>> = {};
  const ced = d.cedula.trim();
  if (!cedulaValida(ced)) e.cedula = 'Ingresa un número de cédula ecuatoriana válido (10 dígitos).';
  else {
    const previa = existentes.find((u) => u.email.trim() === ced);
    if (previa) e.cedula = previa.estadoCuenta === 'pendiente'
      ? 'Ya hay una solicitud con esta cédula esperando aprobación de Recursos Humanos.'
      : 'Ya existe una cuenta con esta cédula. Ingresa con tu clave o pide a Recursos Humanos que la restablezca.';
  }
  if (d.nombres.trim().length < 2) e.nombres = 'Escribe tus nombres.';
  if (!d.sexo) e.sexo = 'Selecciona Hombre o Mujer.';
  if (d.apellidos.trim().length < 2) e.apellidos = 'Escribe tus apellidos.';
  if (!d.area) e.area = 'Selecciona tu área.';
  if (!d.telefono.trim()) e.telefono = 'Escribe tu número de celular.';
  else if (!/^09\d{8}$/.test(d.telefono.replace(/\s|-/g, ''))) e.telefono = 'El celular debe tener 10 dígitos y empezar con 09.';
  if (!d.correo.trim()) e.correo = 'Escribe tu correo electrónico: ahí te avisaremos cuando tu cuenta o tu clave estén listas.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'Revisa el correo electrónico.';
  const p = problemaClave(d.clave, ced);
  if (p) e.clave = p;
  if (!e.clave && d.clave !== d.clave2) e.clave2 = 'Las contraseñas no coinciden.';
  if (!d.acepto) e.acepto = 'Para crear tu cuenta debes autorizar el tratamiento de tus datos personales.';
  return e;
}

export default function Registro({ users, onRegistrar, onVolver, recargarUsuarios }: {
  users: User[];
  onRegistrar: (u: User) => Promise<void> | void;
  onVolver: () => void;
  recargarUsuarios?: () => Promise<User[] | void>;
}) {
  const [d, setD] = useState<Datos>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Datos, string>>>({});
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<User | null>(null);
  const [errorGeneral, setErrorGeneral] = useState('');

  const cambiar = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: undefined }));
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setErrorGeneral('');
    setEnviando(true);
    try {
      // Usar la lista más reciente para no duplicar cédulas registradas desde otro dispositivo
      const frescos = (await recargarUsuarios?.().catch(() => undefined)) || users;
      const e = validarRegistro(d, frescos);
      setErrores(e);
      if (Object.keys(e).length) {
        const primero = Object.keys(e)[0];
        document.getElementById(`reg-${primero}`)?.focus();
        return;
      }
      const ahora = new Date().toISOString();
      const nombre = `${titulo(d.nombres)} ${titulo(d.apellidos)}`;
      const nuevo: User = {
        id: `usr-${Date.now()}`,
        name: nombre,
        nombreCertificado: nombre,
        email: d.cedula.trim(),
        role: 'user',
        passwordHash: await hashClave(d.clave),
        createdAt: ahora,
        isActive: false,
        estadoCuenta: 'pendiente',
        solicitadoAt: ahora,
        area: d.area,
        sexo: d.sexo || undefined,
        telefono: d.telefono.replace(/\s|-/g, '') || undefined,
        correo: d.correo.trim().toLowerCase() || undefined,
        debeCambiarClave: false,
        consentimientoAt: ahora,
        consentimientoVersion: VERSION_AVISO_PRIVACIDAD,
      };
      await onRegistrar(nuevo);
      setListo(nuevo);
    } catch (err) {
      setErrorGeneral(`No se pudo enviar la solicitud. Revisa tu conexión e inténtalo de nuevo. (${(err as Error)?.message ?? err})`);
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="h-8 w-8" /></div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">Solicitud enviada</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Gracias, {listo.name.split(' ')[0]}. Recursos Humanos revisará tus datos y aprobará tu cuenta.
          Cuando esté aprobada podrás ingresar con tu cédula <strong className="text-slate-900">{listo.email}</strong> y la contraseña que creaste.
        </p>
        <button onClick={onVolver} className="mt-6 w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[15px] font-semibold">Volver al inicio de sesión</button>
      </div>
    );
  }

  const ent = 'block w-full px-3.5 py-3 border rounded-xl text-[15px] bg-white text-slate-900 placeholder-slate-400 outline-none transition-colors';
  const borde = (k: keyof Datos) => (errores[k] ? 'border-red-400' : 'border-slate-200');

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <div>
        <button type="button" onClick={onVolver} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 -ml-1 px-1 py-1 rounded-lg">
          <ArrowLeft className="h-4 w-4" />Volver
        </button>
        <h1 className="mt-3 text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Crear mi cuenta</h1>
        <p className="text-sm text-slate-500 mt-1.5">Completa tus datos. Recursos Humanos revisará y aprobará tu cuenta antes de que puedas ingresar.</p>
      </div>

      <Seccion titulo="Datos personales">
        <Campo k="cedula" etiqueta="Número de cédula" error={errores.cedula}>
          <input id="reg-cedula" inputMode="numeric" maxLength={10} autoComplete="username" value={d.cedula}
            onChange={(e) => cambiar('cedula', e.target.value.replace(/\D/g, ''))} placeholder="0912345678" className={`${ent} ${borde('cedula')}`} />
        </Campo>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo k="nombres" etiqueta="Nombres" error={errores.nombres}>
            <input id="reg-nombres" autoComplete="given-name" value={d.nombres} onChange={(e) => cambiar('nombres', e.target.value)} placeholder="María José" className={`${ent} ${borde('nombres')}`} />
          </Campo>
          <Campo k="apellidos" etiqueta="Apellidos" error={errores.apellidos}>
            <input id="reg-apellidos" autoComplete="family-name" value={d.apellidos} onChange={(e) => cambiar('apellidos', e.target.value)} placeholder="Pérez Andrade" className={`${ent} ${borde('apellidos')}`} />
          </Campo>
        </div>
        <Campo k="sexo" etiqueta="Sexo" error={errores.sexo} ayuda="Solo se usa en las estadísticas de igualdad de la empresa, sin mostrar nombres.">
          <div id="reg-sexo" tabIndex={-1} className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sexo">
            {([['M', 'Hombre'], ['F', 'Mujer']] as const).map(([v, t]) => (
              <button key={v} type="button" role="radio" aria-checked={d.sexo === v} onClick={() => cambiar('sexo', v)}
                className={`py-3 px-2 rounded-xl border text-sm sm:text-[15px] font-semibold leading-tight transition-colors ${d.sexo === v ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]' : `${borde('sexo')} bg-white text-slate-600 hover:border-slate-300`}`}>{t}</button>
            ))}
          </div>
        </Campo>
      </Seccion>

      <Seccion titulo="Trabajo y contacto">
        <Campo k="area" etiqueta="Área" error={errores.area}>
          <select id="reg-area" value={d.area} onChange={(e) => cambiar('area', e.target.value)} className={`${ent} ${borde('area')} ${d.area ? '' : 'text-slate-400'}`}>
            <option value="">Selecciona tu área</option>
            {CORPORATE_AREAS.map((a) => <option key={a} value={a} className="text-slate-900">{titulo(a)}</option>)}
          </select>
        </Campo>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo k="telefono" etiqueta="Celular" error={errores.telefono}>
            <input id="reg-telefono" required type="tel" inputMode="tel" autoComplete="tel" value={d.telefono} onChange={(e) => cambiar('telefono', e.target.value)} placeholder="0991234567" className={`${ent} ${borde('telefono')}`} />
          </Campo>
          <Campo k="correo" etiqueta="Correo electrónico" error={errores.correo}>
            <input id="reg-correo" required type="email" inputMode="email" autoComplete="email" value={d.correo} onChange={(e) => cambiar('correo', e.target.value)} placeholder="nombre@correo.com" className={`${ent} ${borde('correo')}`} />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Tu contraseña">
        <Campo k="clave" etiqueta="Contraseña" error={errores.clave} ayuda="Mínimo 8 caracteres, con letras y números. No uses tu cédula.">
          <div className="relative">
            <input id="reg-clave" type={verClave ? 'text' : 'password'} autoComplete="new-password" value={d.clave} onChange={(e) => cambiar('clave', e.target.value)} className={`${ent} ${borde('clave')} pr-12`} />
            <button type="button" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-1 my-auto h-10 w-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700">
              {verClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Campo>
        <Campo k="clave2" etiqueta="Repite la contraseña" error={errores.clave2}>
          <input id="reg-clave2" type={verClave ? 'text' : 'password'} autoComplete="new-password" value={d.clave2} onChange={(e) => cambiar('clave2', e.target.value)} className={`${ent} ${borde('clave2')}`} />
        </Campo>
      </Seccion>

      <TarjetaAutorizacion id="reg-acepto" acepto={d.acepto} onCambiar={(v) => cambiar('acepto', v)} error={errores.acepto}
        nombre={d.nombres.trim() || d.apellidos.trim() ? `${titulo(d.nombres)} ${titulo(d.apellidos)}`.trim() : undefined}
        cedula={cedulaValida(d.cedula.trim()) ? d.cedula.trim() : undefined} />

      {errorGeneral && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errorGeneral}</p>}
      {Object.values(errores).some(Boolean) && <p className="text-sm text-red-700" role="alert">Revisa los campos marcados en rojo.</p>}

      <button id="btn-enviar-registro" type="submit" disabled={enviando}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-70">
        {enviando ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</> : 'Enviar solicitud'}
      </button>
    </form>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-semibold text-slate-500 mb-3">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Campo({ k, etiqueta, error, ayuda, opcional, children }: { k: string; etiqueta: string; error?: string; ayuda?: string; opcional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`reg-${k}`} className="block text-sm font-semibold text-slate-800 mb-1.5">
        {etiqueta}{opcional && <span className="ml-1 font-normal text-slate-400">(opcional)</span>}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : ayuda ? <p className="mt-1.5 text-xs text-slate-500">{ayuda}</p> : null}
    </div>
  );
}
