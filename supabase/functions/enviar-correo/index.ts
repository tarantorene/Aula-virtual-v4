// Función de Supabase: envía los avisos por correo del Aula Virtual Fundametz.
//
// Los datos del servidor de correo se guardan como "secretos" en Supabase
// (Edge Functions → Secrets), nunca en el código ni en la página web:
//   SMTP_HOST   mail.exclusivehosting.net
//   SMTP_PORT   2525
//   SMTP_USER   notificacion@fundametz.com
//   SMTP_PASS   (la clave del correo)
//   CORREO_RRHH correo de Recursos Humanos que recibe las solicitudes
//   APP_URL     dirección del Aula Virtual (ej. https://aula-fundametz.netlify.app)
//
// Para evitar abusos, la función NO acepta destinatarios ni textos libres:
// solo recibe { tipo, cedula }, busca a la persona en la base de datos, comprueba
// que el aviso corresponda a algo que acaba de pasar y envía un texto ya redactado.

import nodemailer from 'npm:nodemailer@6.9.16';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const env = (k: string, def = '') => Deno.env.get(k) ?? def;
const HORAS_CAMBIO_CLAVE = 24;
const VENTANA_MIN = 15; // el aviso solo sale si el hecho ocurrió hace menos de 15 minutos

type Perfil = {
  name: string; email: string; correo: string | null; is_active: boolean;
  estado_cuenta: string | null; cambio_clave_hasta: string | null; solicitud_clave_at: string | null;
  solicitado_at: string | null; revisado_at: string | null; motivo_rechazo: string | null; area: string | null;
};
type Tipo = 'clave_habilitada' | 'cuenta_aprobada' | 'cuenta_rechazada' | 'solicitud_clave' | 'cuenta_nueva';

const reciente = (t: string | null, ahora = Date.now()) => !!t && ahora - Date.parse(t) >= -5 * 60_000 && ahora - Date.parse(t) < VENTANA_MIN * 60_000;
const ocultar = (c: string) => c.replace(/^(.)(.*)(@.*)$/, (_m, a, b, d) => a + '*'.repeat(Math.min(b.length, 6)) + d);
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const correoValido = (c?: string | null) => !!c && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

// ¿El aviso corresponde a lo que hay en la base de datos?
function corresponde(tipo: Tipo, u: Perfil): boolean {
  switch (tipo) {
    case 'clave_habilitada': {
      if (!u.is_active || !u.cambio_clave_hasta) return false;
      const habilitadoEn = new Date(Date.parse(u.cambio_clave_hasta) - HORAS_CAMBIO_CLAVE * 3600_000).toISOString();
      return reciente(habilitadoEn);
    }
    case 'cuenta_aprobada': return u.estado_cuenta === 'aprobada' && reciente(u.revisado_at);
    case 'cuenta_rechazada': return u.estado_cuenta === 'rechazada' && reciente(u.revisado_at);
    case 'solicitud_clave': return u.is_active && reciente(u.solicitud_clave_at);
    case 'cuenta_nueva': return u.estado_cuenta === 'pendiente' && reciente(u.solicitado_at);
  }
}

function redactar(tipo: Tipo, u: Perfil, app: string) {
  const nombre = esc(u.name.split(' ')[0] || u.name);
  const enlace = app ? `<p style="margin:24px 0"><a href="${esc(app)}" style="background:#2563EB;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">Abrir el Aula Virtual</a></p>` : '';
  const hasta = u.cambio_clave_hasta
    ? new Date(u.cambio_clave_hasta).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
    : '';
  const plantillas: Record<Tipo, { asunto: string; html: string }> = {
    clave_habilitada: {
      asunto: 'Ya puedes crear tu nueva contraseña — Aula Virtual Fundametz',
      html: `<p>Hola ${nombre}:</p>
        <p>Recursos Humanos habilitó el cambio de tu contraseña.</p>
        <ol><li>Entra al Aula Virtual.</li><li>Escribe tu número de cédula y pulsa <b>Ingresar</b> (sin contraseña).</li><li>Crea la nueva contraseña que tú quieras.</li></ol>
        <p>Tienes plazo hasta el <b>${esc(hasta)}</b>. Tu cuenta, tu avance y tus certificados se conservan.</p>${enlace}
        <p style="color:#64748B;font-size:13px">Si tú no pediste este cambio, avisa a Recursos Humanos.</p>`,
    },
    cuenta_aprobada: {
      asunto: 'Tu cuenta fue aprobada — Aula Virtual Fundametz',
      html: `<p>Hola ${nombre}:</p><p>Recursos Humanos aprobó tu cuenta. Ya puedes ingresar con tu número de cédula y la contraseña que elegiste al registrarte.</p>${enlace}`,
    },
    cuenta_rechazada: {
      asunto: 'Sobre tu solicitud de cuenta — Aula Virtual Fundametz',
      html: `<p>Hola ${nombre}:</p><p>Tu solicitud de cuenta no fue aprobada.${u.motivo_rechazo ? ` Motivo: <i>${esc(u.motivo_rechazo)}</i>.` : ''}</p><p>Si crees que es un error, acércate a Recursos Humanos.</p>`,
    },
    solicitud_clave: {
      asunto: `Pedido de clave nueva: ${u.name}`,
      html: `<p><b>${esc(u.name)}</b> (cédula ${esc(u.email)}${u.area ? `, ${esc(u.area)}` : ''}) pidió restablecer su contraseña.</p><p>Revísalo en el menú <b>Solicitudes</b> del Aula Virtual.</p>${enlace}`,
    },
    cuenta_nueva: {
      asunto: `Cuenta nueva por aprobar: ${u.name}`,
      html: `<p><b>${esc(u.name)}</b> (cédula ${esc(u.email)}${u.area ? `, ${esc(u.area)}` : ''}) creó su cuenta y espera aprobación.</p><p>Revísala en el menú <b>Solicitudes</b> del Aula Virtual.</p>${enlace}`,
    },
  };
  const p = plantillas[tipo];
  const html = `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#0F172A;max-width:560px;margin:auto;line-height:1.55">
    <div style="border-bottom:3px solid #2563EB;padding-bottom:10px;margin-bottom:18px"><b style="font-size:18px">Fundametz</b> <span style="color:#64748B">· Aula Virtual</span></div>
    ${p.html}
    <p style="color:#94A3B8;font-size:12px;margin-top:28px">Mensaje automático de FUNDAMETZ S.A. No respondas a este correo.</p></div>`;
  return { asunto: p.asunto, html };
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return responder({ enviado: false, motivo: 'metodo' }, 405);

  let tipo: Tipo, cedula: string;
  try {
    ({ tipo, cedula } = await req.json());
  } catch { return responder({ enviado: false, motivo: 'datos' }, 400); }
  const tipos: Tipo[] = ['clave_habilitada', 'cuenta_aprobada', 'cuenta_rechazada', 'solicitud_clave', 'cuenta_nueva'];
  if (!tipos.includes(tipo) || !/^\d{10}$/.test(String(cedula ?? ''))) return responder({ enviado: false, motivo: 'datos' }, 400);

  const faltan = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].filter((k) => !env(k));
  if (faltan.length) return responder({ enviado: false, motivo: `faltan secretos: ${faltan.join(', ')}` }, 500);

  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
  // La app guarda el cambio y enseguida pide el aviso: se reintenta unos segundos por si aún no se ve.
  let u: Perfil | null = null;
  for (let i = 0; i < 4; i++) {
    const { data } = await db.from('profiles')
      .select('name,email,correo,is_active,estado_cuenta,cambio_clave_hasta,solicitud_clave_at,solicitado_at,revisado_at,motivo_rechazo,area')
      .eq('email', cedula).maybeSingle();
    u = data as Perfil | null;
    if (u && corresponde(tipo, u)) break;
    u = null;
    await espera(1500);
  }
  // Respuesta neutra: no revela si la cédula existe
  if (!u) return responder({ enviado: false, motivo: 'no-corresponde' });

  const paraRRHH = tipo === 'solicitud_clave' || tipo === 'cuenta_nueva';
  const destino = paraRRHH ? env('CORREO_RRHH') : u.correo;
  if (!correoValido(destino)) return responder({ enviado: false, motivo: paraRRHH ? 'falta CORREO_RRHH' : 'sin-correo' });

  const puerto = Number(env('SMTP_PORT', '2525'));
  const transporte = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: puerto,
    secure: puerto === 465,          // 465 = SSL directo; 2525/587 = STARTTLS si el servidor lo ofrece
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
    connectionTimeout: 20_000,
    tls: { rejectUnauthorized: false }, // muchos hostings compartidos usan certificados genéricos
  });
  const { asunto, html } = redactar(tipo, u, env('APP_URL'));
  try {
    await transporte.sendMail({
      from: `"${env('SMTP_NOMBRE', 'Aula Virtual Fundametz')}" <${env('SMTP_USER')}>`,
      to: destino!,
      subject: asunto,
      html,
      text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
  } catch (e) {
    console.error('SMTP', e);
    return responder({ enviado: false, motivo: 'smtp: ' + (e instanceof Error ? e.message : String(e)) });
  }
  return responder({ enviado: true, destino: paraRRHH ? 'Recursos Humanos' : ocultar(destino!) });
});
