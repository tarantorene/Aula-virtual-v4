import { getSupabaseClient } from './supabase';

/**
 * Avisos por correo del Aula Virtual.
 *
 * El navegador NUNCA conoce el servidor ni la clave del correo: solo pide a la
 * función "enviar-correo" de Supabase que envíe un aviso ya redactado. La función
 * revisa en la base de datos que el aviso corresponda (por ejemplo, que la clave
 * realmente se haya habilitado hace unos minutos) y lo envía al correo registrado.
 */
export type TipoCorreo =
  | 'clave_habilitada'   // al colaborador: ya puede crear su nueva contraseña
  | 'cuenta_aprobada'    // al colaborador: su cuenta fue aprobada
  | 'cuenta_rechazada'   // al colaborador: su solicitud no fue aprobada
  | 'solicitud_clave'    // a RR. HH.: alguien olvidó su clave
  | 'cuenta_nueva';      // a RR. HH.: alguien creó su cuenta

export type ResultadoCorreo =
  | { estado: 'enviado'; destino?: string }
  | { estado: 'sin-correo' | 'no-configurado' | 'error'; detalle?: string };

export async function enviarCorreo(tipo: TipoCorreo, cedula: string): Promise<ResultadoCorreo> {
  const supabase = getSupabaseClient();
  if (!supabase) return { estado: 'no-configurado' };
  try {
    const { data, error } = await supabase.functions.invoke('enviar-correo', { body: { tipo, cedula } });
    if (error) return { estado: 'error', detalle: error.message };
    if (data?.enviado) return { estado: 'enviado', destino: data.destino };
    if (data?.motivo === 'sin-correo') return { estado: 'sin-correo' };
    return { estado: 'error', detalle: data?.motivo };
  } catch (e) {
    return { estado: 'error', detalle: e instanceof Error ? e.message : String(e) };
  }
}
