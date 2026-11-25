-- Aula Virtual Fundametz · actualización de la base de datos (versiones 8, 9 y 10)
-- Ejecute esto en Supabase → SQL Editor si instaló la base de datos antes del 25-nov-2026.
-- Agrega: registro de cuentas con aprobación, pedidos de clave olvidada y cambio de clave habilitado por RR. HH.
-- No borra datos y se puede volver a ejecutar.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS estado_cuenta TEXT NOT NULL DEFAULT 'aprobada' CHECK (estado_cuenta IN ('pendiente','aprobada','rechazada'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS correo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solicitado_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS revisado_por TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS revisado_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solicitud_clave_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cambio_clave_hasta TIMESTAMPTZ;
