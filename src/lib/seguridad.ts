// ============================================================================
// SEGURIDAD DE CUENTAS
// - Las contraseñas se guardan como hash SHA-256 con "sal" (nunca en texto plano).
// - Las claves antiguas en texto plano se aceptan UNA vez y obligan a crear una nueva.
// - Claves temporales aleatorias para altas, importaciones y restablecimientos.
// ============================================================================

const PREFIJO = 'sha256$';

async function sha256(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Genera el hash almacenable de una contraseña. La "sal" es aleatoria por cada clave. */
export async function hashClave(clave: string): Promise<string> {
  const sal = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${PREFIJO}${sal}$${await sha256(`${sal}:${clave}`)}`;
}

export const esHash = (valor: string | undefined | null) => !!valor && valor.startsWith(PREFIJO);

/**
 * Verifica una contraseña contra lo almacenado.
 * `heredada = true` indica que estaba en texto plano (formato antiguo) y debe reemplazarse.
 */
export async function verificarClave(clave: string, almacenada: string): Promise<{ ok: boolean; heredada: boolean }> {
  if (!almacenada) return { ok: false, heredada: false };
  if (!esHash(almacenada)) return { ok: clave === almacenada, heredada: true };
  const [, sal, hash] = almacenada.split('$');
  return { ok: (await sha256(`${sal}:${clave}`)) === hash, heredada: false };
}

/** Clave temporal sin caracteres ambiguos (0/O, 1/l/I). */
export function claveTemporal(largo = 8): string {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(largo));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('');
}

/** Validación de cédula ecuatoriana (algoritmo módulo 10). */
export function cedulaValida(c: string): boolean {
  if (!/^\d{10}$/.test(c)) return false;
  const prov = Number(c.slice(0, 2));
  if (prov < 1 || (prov > 24 && prov !== 30)) return false;
  if (Number(c[2]) > 5) return false;
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coef.reduce((s, k, i) => {
    let v = Number(c[i]) * k;
    if (v > 9) v -= 9;
    return s + v;
  }, 0);
  return (10 - (suma % 10)) % 10 === Number(c[9]);
}

/** Reglas para la contraseña personal. Devuelve el problema o null si es válida. */
export function problemaClave(clave: string, usuario: string): string | null {
  if (clave.length < 8) return 'Debe tener al menos 8 caracteres.';
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(clave) || !/\d/.test(clave)) return 'Debe combinar letras y números.';
  if (usuario && clave.toLowerCase().includes(usuario.toLowerCase())) return 'No puede contener tu número de cédula o usuario.';
  if (['12345678', 'fundametz', 'password', 'contraseña'].some((d) => clave.toLowerCase().includes(d))) return 'Es demasiado fácil de adivinar.';
  return null;
}

export const VERSION_AVISO_PRIVACIDAD = '2026-1';
