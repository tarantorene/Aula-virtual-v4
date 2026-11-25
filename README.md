# Aula Virtual FUNDAMETZ

Plataforma de capacitación del personal de FUNDAMETZ S.A.: cursos en cápsulas cortas, actividades prácticas, evaluaciones, plan anual de 40 horas del Ministerio del Trabajo (Acuerdo MDT-2025-006) y certificados con código QR verificable. Pensada para usarse desde el celular, la tablet o la computadora.

**Tecnología:** React 19 · Vite 6 · Tailwind CSS 4 · Supabase (base de datos).

## Funciones principales

**Colaborador**
- Tablero con su plan de 40 h (anillo de progreso) y botón «Continuar curso».
- Lecturas divididas en cápsulas de 1–2 min, con pregunta rápida y botón **Escuchar** (lectura en voz alta).
- Actividades prácticas escritas, evaluación final con intentos y tiempo límite.
- Tiempo efectivo de estudio, sesiones presenciales y certificados en PDF con QR.
- Recorrido guiado en el primer ingreso; se instala en el celular desde «Agregar a pantalla de inicio».

- Puede crear su propia cuenta desde la pantalla de inicio («Crear mi cuenta»); entra cuando Recursos Humanos la aprueba.
- Si olvida su clave, la pide desde «¿Olvidaste tu contraseña?»; cuando Recursos Humanos la restablece, crea la contraseña que desee en su siguiente ingreso.

**Recursos Humanos (administrador)**
- Cursos, materiales, preguntas y actividades; curso de Igualdad 2026 (40 h) listo para cargar.
- Cuentas: aprobación de las solicitudes de los colaboradores, restablecimiento de claves olvidadas (sin perder el avance), alta individual o importación desde Excel con claves temporales.
- Panel de cumplimiento MDT con exportación a Excel, revisión de actividades, sesiones presenciales y bitácora de auditoría.
- Aviso de privacidad (LOPDP) aceptado por cada colaborador en su primer ingreso.

## 1. Preparar la base de datos (una vez)

1. En [Supabase](https://supabase.com/dashboard) abra su proyecto → **SQL Editor → New query**.
2. Pegue el contenido de [`supabase/instalacion.sql`](supabase/instalacion.sql).
3. Al final del archivo cambie `CAMBIE_ESTA_CLAVE` por la contraseña del administrador y pulse **Run**.

El script crea 15 tablas y la cuenta `admin`. No borra datos y se puede volver a ejecutar.

¿Ya tenía la base instalada de una versión anterior? Ejecute también [`supabase/actualizacion.sql`](supabase/actualizacion.sql).

## 2. Publicar

La app necesita dos datos de Supabase (**Connect** o **Project Settings → API Keys**):

| Variable | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, por ejemplo `https://abcdxyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave **pública**: Publishable key (`sb_publishable_…`) o `anon public` |

> Nunca use la clave `secret` ni `service_role`: no deben ir en una página web.

**Vercel:** *Add New → Project* → importe este repositorio → en *Environment Variables* agregue las dos variables → *Deploy*. La configuración de compilación ya está en `vercel.json`.

**Netlify:** *Add new site → Import an existing project* → elija este repositorio → *Site configuration → Environment variables* con las dos variables → *Deploy*. La configuración ya está en `netlify.toml`.

**Sin variables de entorno:** también puede escribir los dos datos en `public/config.js`. Las variables de entorno, si existen, tienen prioridad.

Cada vez que suba cambios a GitHub, Vercel o Netlify publican la nueva versión solos.

## 3. Primer ingreso

1. Entre con el usuario `admin` y la contraseña del paso 1. (Sin Supabase, en modo local, la cuenta inicial es `admin` / `admin2026` y el sistema pide cambiarla.)
2. **Cumplimiento MDT → Cargar curso (40 h)**.
3. Pida al personal que entre a la dirección y pulse **Crear mi cuenta**; apruebe las solicitudes en **Gestión de Cuentas**. También puede usar **Importar Excel** o **Nueva Cuenta** y entregar claves temporales.

## Trabajar en la computadora

Requiere [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
cp .env.example .env.local   # y complete los dos valores
npm run dev                  # http://localhost:3000
npm run build                # genera la carpeta dist/
```

Sin datos de Supabase la app funciona en **modo local**: guarda todo en el navegador (útil para probar, no para producción).

## Seguridad

- Las contraseñas se guardan cifradas (SHA-256 con sal) y se bloquea el ingreso tras 5 intentos fallidos.
- **Pendiente antes de registrar a todo el personal:** las políticas de Supabase permiten leer y escribir con la clave pública. Se recomienda migrar el ingreso a Supabase Auth con permisos por usuario (cada colaborador ve solo lo suyo y RR. HH. todo).

## Estructura

```
src/
  App.tsx                     estado general, ingreso y sincronización
  components/
    AdminDashboard.tsx        panel de Recursos Humanos
    UserDashboard.tsx         panel del colaborador
    Login.tsx                 inicio de sesión
    extras/                   cumplimiento MDT, cápsulas, recorrido, cuentas, certificados…
  lib/                        Supabase, seguridad, cálculo de horas, Excel, voz, curso de Igualdad
public/
  config.js                   conexión opcional sin variables de entorno
  manifest.webmanifest        app instalable en el celular
supabase/instalacion.sql      base de datos completa
supabase/actualizacion.sql columnas nuevas para bases instaladas antes
CAMBIOS.md                    historial de versiones
```
