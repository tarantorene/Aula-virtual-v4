# Avisos por correo (función `enviar-correo`)

Envía, con tu propio correo `notificacion@fundametz.com`, estos avisos:

| Cuándo | A quién |
|---|---|
| RR. HH. habilita el cambio de clave | Colaborador (si tiene correo registrado) |
| RR. HH. aprueba o rechaza una cuenta | Colaborador |
| Alguien pide clave nueva o crea su cuenta | Correo de Recursos Humanos |

La clave del correo **no** va en la página web ni en GitHub: se guarda como *secreto* en Supabase.

## 1. Crear la función (desde el navegador, sin instalar nada)
1. Supabase → tu proyecto → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nombre: `enviar-correo` (exactamente así).
3. Borra el ejemplo, pega todo el contenido de `index.ts` y pulsa **Deploy function**.
4. En los ajustes de la función, desactiva **Verify JWT** (la app usa la clave publicable, no inicio de sesión de Supabase).

## 2. Guardar los secretos
Edge Functions → **Secrets** → agrega uno por uno:

| Nombre | Valor |
|---|---|
| `SMTP_HOST` | `mail.exclusivehosting.net` |
| `SMTP_PORT` | `2525` |
| `SMTP_USER` | `notificacion@fundametz.com` |
| `SMTP_PASS` | la clave de ese correo |
| `CORREO_RRHH` | el correo de RR. HH. que recibe las solicitudes |
| `APP_URL` | la dirección del Aula Virtual publicada |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen incluidos; no los agregues.

## 3. Probar
En el Aula Virtual: Gestión de Cuentas → editar a una persona → ponle tu propio correo → **Restablecer clave → Habilitar cambio**. La ventana dirá «Correo enviado a …».
Si dice que no se pudo: Edge Functions → `enviar-correo` → **Logs** muestra el motivo.

## Seguridad
La función no acepta textos ni destinatarios libres: solo `{ tipo, cédula }`, revisa en la base que el hecho haya ocurrido hace menos de 15 minutos y envía un texto ya redactado. Así nadie puede usarla para mandar correos a terceros.
