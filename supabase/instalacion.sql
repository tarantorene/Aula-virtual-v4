-- ============================================================================
-- AULA VIRTUAL FUNDAMETZ · INSTALACIÓN COMPLETA EN SUPABASE (versión 7)
-- Cómo usar: Supabase → SQL Editor → New query → pegue TODO este archivo → Run.
-- Es SEGURO volver a ejecutarlo: no borra tablas ni datos existentes
-- (solo crea lo que falta y agrega columnas nuevas).
--
-- ANTES DE EJECUTAR: cambie la contraseña del administrador en la PARTE 3
-- (busque  CAMBIE_ESTA_CLAVE  al final del archivo).
-- ============================================================================

-- ============================ PARTE 1: tablas base ===========================
-- ============================================================================
-- SCHEMAS Y TABLAS PARA LA INTEGRACIÓN CON SUPABASE (ACTUALIZADO CON LLAVES TEXT)
-- Plataforma: Aula Virtual Fundametz
-- ============================================================================


-- 1. TABLA: PROFILES (Perfiles de usuario)
-- Tipo de llave primaria cambiado a TEXT para soportar IDs del frontend como 'admin-1' o 'usr-1715493012000'
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    area TEXT CHECK (area IN (
        'ADMINISTRACION',
        'BATERIAS / BODEGA',
        'CALIDAD',
        'COMERCIO EXTERIOR',
        'MANTENIMIENTO',
        'MEDIO AMBIENTE',
        'PELLET',
        'PIROLISIS',
        'PLASTICO',
        'RECICLAJE / TRATAMIENTO DE AGUAS',
        'RECUPERACION',
        'RECURSOS HUMANOS',
        'REFINACION',
        'SALUD OCUPACIONAL',
        'SEGURIDAD INDUSTRIAL',
        'SISTEMAS INFORMATICOS'
    )),
    password_hash TEXT NOT NULL, -- Columna crítica requerida para la verificación de contraseñas
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABLA: TOPICS (Temas o cursos de capacitación)
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    min_score_to_pass INTEGER NOT NULL DEFAULT 70 CHECK (min_score_to_pass BETWEEN 0 AND 100),
    max_attempts INTEGER NOT NULL DEFAULT 3,
    time_limit_minutes INTEGER NOT NULL DEFAULT 0,
    randomize_questions BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    due_date DATE,
    target_areas TEXT[] DEFAULT '{}', -- Áreas designadas para este tema
    has_initial_quiz BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLA: MATERIALS (Materiales didácticos por tema con soporte para Storage)
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('document', 'video', 'interactive', 'pdf', 'pptx')),
    content TEXT NOT NULL, -- Contenido didáctico o instrucciones en formato Markdown
    url TEXT, -- URL externa (ej: YouTube o Vimeo)
    
    -- ===== CAMPOS DE ALMACENAMIENTO DE ARCHIVOS (SUPABASE STORAGE) =====
    file_path TEXT,      -- Ruta del archivo en el bucket (ej: "materials/course-123/introduccion.pptx")
    file_url TEXT,       -- Enlace público directo generado por Supabase Storage
    file_size INTEGER,   -- Tamaño del archivo en bytes
    file_name TEXT,      -- Nombre original del archivo cargado (ej: "Guía de Seguridad.pptx")
    
    estimated_minutes INTEGER NOT NULL DEFAULT 5 CHECK (estimated_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA: QUESTIONS (Preguntas de evaluaciones para diagnóstico o examen final)
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL, -- Array con los textos de las opciones (ej: ARRAY['A', 'B'])
    correct_option_index INTEGER NOT NULL CHECK (correct_option_index >= 0),
    type TEXT NOT NULL DEFAULT 'final' CHECK (type IN ('initial', 'final')),
    format TEXT NOT NULL DEFAULT 'multiple' CHECK (format IN ('multiple', 'true_false')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLA: QUIZ_ATTEMPTS (Historial de intentos de exámenes realizados por colaboradores)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0.00 AND 100.00), -- Porcentaje de puntaje
    answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- Relación pregunta_id -> índice_respuesta_seleccionada
    passed BOOLEAN NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
    type TEXT NOT NULL DEFAULT 'final' CHECK (type IN ('initial', 'final')),
    taken_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLA: USER_PROGRESS (Seguimiento del progreso detallado en cada tema)
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    completed_material_ids TEXT[] DEFAULT '{}', -- Materiales leídos o vistos (IDs tipo TEXT)
    quiz_status TEXT NOT NULL DEFAULT 'not_started' CHECK (quiz_status IN ('not_started', 'failed', 'passed')),
    highest_score NUMERIC(5,2),
    attempts_count INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    initial_quiz_completed BOOLEAN NOT NULL DEFAULT false,
    initial_quiz_score NUMERIC(5,2),
    PRIMARY KEY (user_id, topic_id)
);

-- 7. TABLA: COURSE_REVIEWS (Comentarios de retroalimentación)
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    satisfaction_rating INTEGER, -- 0-3 satisfaction
    clarity_rating INTEGER      -- 0-3 clarity
);

-- 8. TABLA: MESSAGES (Mensajería interna del buzón, automáticos o manuales)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    recipient_id TEXT NOT NULL, -- ID del usuario específico o el comodín 'ALL'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('automatic_progress', 'automatic_due_date', 'manual')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABLA: USER_ASSIGNMENTS (Opcional: Entregables de archivos subidos por el colaborador)
CREATE TABLE IF NOT EXISTS public.user_assignments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,   -- Ruta en el bucket "submissions"
    file_url TEXT NOT NULL,    -- URL pública del entregable
    file_name TEXT NOT NULL,   -- Nombre original
    file_size INTEGER,         -- Tamaño en bytes
    comments TEXT,             -- Comentarios adicionales
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================================
-- SEGURIDAD DE NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ============================================================================

-- Activar RLS en todas las tablas creadas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assignments ENABLE ROW LEVEL SECURITY;

-- Crear políticas universales de acceso total para permitir lectura/escritura 
-- tanto a clientes anónimos con API Key (anon) como autenticados.
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.profiles;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.topics;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.topics FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.materials;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.materials FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.questions;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.questions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.quiz_attempts;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.quiz_attempts FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.user_progress;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.course_reviews;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.course_reviews FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.messages;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.messages FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.user_assignments;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.user_assignments FOR ALL USING (true) WITH CHECK (true);


-- ===================== PARTE 2: cumplimiento MDT y extras ====================
-- ============================================================================
-- EXTENSIÓN: CUMPLIMIENTO MDT-2025-006 (40 HORAS) · LOPDP · AUDITORÍA
-- Aula Virtual Fundametz
--
-- ============================================================================

-- 1. NUEVAS COLUMNAS EN PERFILES ---------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('M', 'F'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS es_autoridad BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS debe_cambiar_clave BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consentimiento_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consentimiento_version TEXT;

-- 2. NUEVAS COLUMNAS EN CURSOS (TOPICS) --------------------------------------
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS horas_acreditadas NUMERIC(5,1) NOT NULL DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS eje_mdt TEXT CHECK (eje_mdt IN ('derechos','genero','violencia','igual_valor','otro'));
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS minutos_minimos INTEGER NOT NULL DEFAULT 0;
-- Columnas de entrega que la app ya utiliza (por si faltan)
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS delivered_at DATE;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS delivered_by TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS delivered_notes TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS points NUMERIC(5,2) DEFAULT 10;

-- 2b. ESTRUCTURA DE MÓDULO (actividades, video obligatorio, recursos, nombre en certificado)
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS actividades JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS nota_minima_modulo INTEGER NOT NULL DEFAULT 70;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS video_obligatorio BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS recursos JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nombre_certificado TEXT;

-- Registro de cuentas por el propio colaborador (con aprobación de RR. HH.)
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


-- Respuestas a las actividades prácticas escritas
CREATE TABLE IF NOT EXISTS public.respuestas_actividades (
    id TEXT PRIMARY KEY,                       -- usuario|actividad
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    actividad_id TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    puntos NUMERIC(5,1) NOT NULL DEFAULT 0,
    revisado_por TEXT,
    comentario_revision TEXT,
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS respuestas_actividades_topic_idx ON public.respuestas_actividades (topic_id);

-- 3. TIEMPO EFECTIVO DE ESTUDIO (evidencia por día) --------------------------
CREATE TABLE IF NOT EXISTS public.tiempo_estudio (
    id TEXT PRIMARY KEY,                       -- usuario|material|fecha
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL,
    fecha DATE NOT NULL,
    segundos INTEGER NOT NULL DEFAULT 0 CHECK (segundos >= 0),
    primer_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tiempo_estudio_user_idx ON public.tiempo_estudio (user_id);

-- 4. SESIONES PRESENCIALES CON ASISTENCIA ------------------------------------
CREATE TABLE IF NOT EXISTS public.sesiones_presenciales (
    id TEXT PRIMARY KEY,
    tema TEXT NOT NULL,
    eje TEXT NOT NULL DEFAULT 'otro',
    fecha DATE NOT NULL,
    horas NUMERIC(4,1) NOT NULL CHECK (horas > 0),
    facilitador TEXT DEFAULT '',
    lugar TEXT DEFAULT '',
    asistentes TEXT[] NOT NULL DEFAULT '{}',   -- IDs de perfiles asistentes
    creado_por TEXT,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CERTIFICADOS EMITIDOS (código único + verificación pública) -------------
CREATE TABLE IF NOT EXISTS public.certificados_emitidos (
    codigo TEXT PRIMARY KEY,                   -- FZ-2026-XXXXXXXX
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    cedula TEXT NOT NULL,
    topic_id TEXT NOT NULL,                    -- ID del curso o PLAN-<año>
    titulo TEXT NOT NULL,
    horas NUMERIC(5,1) NOT NULL DEFAULT 0,
    emitido_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, topic_id)
);

-- 6. BITÁCORA DE AUDITORÍA ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auditoria (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    accion TEXT NOT NULL,
    detalle TEXT DEFAULT '',
    at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auditoria_at_idx ON public.auditoria (at DESC);

-- 7. CONFIGURACIÓN (horas mínimas del plan, año) -----------------------------
CREATE TABLE IF NOT EXISTS public.configuracion (
    clave TEXT PRIMARY KEY,
    valor JSONB NOT NULL
);

-- 8. POLÍTICAS (mismo modelo de acceso que el resto del Aula Virtual) --------
ALTER TABLE public.tiempo_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_presenciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_emitidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_actividades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.respuestas_actividades;
CREATE POLICY "Permitir todo a anon y authenticated" ON public.respuestas_actividades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.tiempo_estudio;
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.sesiones_presenciales;
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.certificados_emitidos;
DROP POLICY IF EXISTS "Permitir todo a anon y authenticated" ON public.configuracion;
DROP POLICY IF EXISTS "Auditoria solo insertar y leer" ON public.auditoria;
DROP POLICY IF EXISTS "Auditoria insertar" ON public.auditoria;
DROP POLICY IF EXISTS "Auditoria leer" ON public.auditoria;

CREATE POLICY "Permitir todo a anon y authenticated" ON public.tiempo_estudio FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon y authenticated" ON public.sesiones_presenciales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon y authenticated" ON public.certificados_emitidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a anon y authenticated" ON public.configuracion FOR ALL USING (true) WITH CHECK (true);
-- La auditoría NO se puede editar ni borrar desde la aplicación: solo agregar y consultar
CREATE POLICY "Auditoria insertar" ON public.auditoria FOR INSERT WITH CHECK (true);
CREATE POLICY "Auditoria leer" ON public.auditoria FOR SELECT USING (true);

-- ============================================================================
-- NOTA DE SEGURIDAD
-- Esta versión ya no guarda contraseñas en texto plano (usa hash SHA-256 con sal),
-- pero las políticas "Permitir todo" del esquema original siguen dejando que
-- cualquiera con la clave pública (anon key) lea y modifique las tablas.
-- Para datos reales de trabajadores se recomienda migrar a Supabase Auth con
-- políticas por usuario (ver README_CAMBIOS.md, sección "Siguiente paso").
-- ============================================================================

-- ===================== PARTE 3: cuenta del administrador =====================
-- Crea la cuenta de RR. HH. con una contraseña que solo usted conoce, para que nadie
-- pueda entrar con la clave inicial de fábrica. Cambie el usuario y la clave:
--   usuario  → el texto en  email  (puede ser su cédula o la palabra admin)
--   clave    → reemplace  CAMBIE_ESTA_CLAVE  (mínimo 8 caracteres, con letras y números)
DO $$
DECLARE
  sal TEXT := substr(md5(random()::text || clock_timestamp()::text), 1, 16);
  clave TEXT := 'CAMBIE_ESTA_CLAVE';
BEGIN
  IF clave = 'CAMBIE_ESTA_CLAVE' THEN
    RAISE EXCEPTION 'Cambie CAMBIE_ESTA_CLAVE por la contraseña del administrador antes de ejecutar.';
  END IF;
  INSERT INTO public.profiles (id, name, email, role, area, password_hash, is_active)
  VALUES ('admin-1', 'Administrador General', 'admin', 'admin', 'RECURSOS HUMANOS',
          'sha256$' || sal || '$' || encode(sha256(convert_to(sal || ':' || clave, 'UTF8')), 'hex'), true)
  ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = true;
END $$;
