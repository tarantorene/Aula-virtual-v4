export const CORPORATE_AREAS = [
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
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  passwordHash: string; // Stored plain text for simulation, labeled as hash for standard
  createdAt: string;
  isActive: boolean;
  area?: string; // e.g. 'ADMINISTRACION'
  // --- Extensiones de cumplimiento (MDT / LOPDP) ---
  sexo?: 'M' | 'F'; // Estadísticas internas de igualdad (el MDT-2025-006 no lo exige en el reporte)
  esAutoridad?: boolean; // Máxima autoridad / representante legal (participación obligatoria)
  debeCambiarClave?: boolean; // Clave temporal: se exige cambio en el próximo ingreso
  consentimientoAt?: string; // Fecha de aceptación del aviso de privacidad (LOPDP)
  consentimientoVersion?: string;
  nombreCertificado?: string; // Nombres y apellidos completos confirmados para los certificados
  // --- Registro por el propio colaborador (requiere aprobación de RR. HH.) ---
  estadoCuenta?: EstadoCuenta; // sin valor = cuenta creada por RR. HH. (aprobada)
  cargo?: string;
  telefono?: string;
  correo?: string;
  solicitadoAt?: string;
  revisadoPor?: string;
  revisadoAt?: string;
  motivoRechazo?: string;
  solicitudClaveAt?: string; // el colaborador pidió una clave nueva desde «¿Olvidó su contraseña?»
  cambioClaveHasta?: string; // RR. HH. habilitó que cree su nueva clave en el próximo ingreso (hasta esta fecha)
}

export type EstadoCuenta = 'pendiente' | 'aprobada' | 'rechazada';
export const cuentaPendiente = (u: User) => u.estadoCuenta === 'pendiente';
export const cuentaRechazada = (u: User) => u.estadoCuenta === 'rechazada';

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  minScoreToPass: number; // e.g. 7 (scale 0-10)
  maxAttempts: number; // e.g. 3
  timeLimitMinutes: number; // e.g. 15 (0 for unlimited)
  randomizeQuestions: boolean;
  status: 'draft' | 'published';
  dueDate?: string; // Limit date / Due date format: YYYY-MM-DD
  targetAreas?: string[]; // Areas designated to see this topic. If empty/undefined/contains 'TODAS', visible to all.
  hasInitialQuiz?: boolean; // If true, requires a diagnostic / initial assessment first
  isDelivered?: boolean; // Label whether this training topic has been officially delivered/given
  deliveredAt?: string; // Date when it was delivered (YYYY-MM-DD)
  deliveredBy?: string; // Instructor/Trainer who delivered the course
  deliveredNotes?: string; // Delivery notes, observations, or feedback
  // --- Extensiones de cumplimiento MDT-2025-006 ---
  horasAcreditadas?: number; // Horas que suma al plan anual al aprobarse (0 = no cuenta)
  ejeMdt?: EjeMdt; // Eje temático exigido por el Acuerdo MDT-2025-006
  minutosMinimos?: number; // Tiempo efectivo mínimo de estudio para acreditar las horas
  // --- Estructura de módulo tipo "aula" ---
  actividades?: ActividadPractica[]; // Actividades escritas que suman puntos a la nota del módulo
  notaMinimaModulo?: number; // Nota mínima del módulo (0-100) cuando hay actividades. Por defecto 70
  videoObligatorio?: boolean; // El primer video del curso debe verse antes de las lecturas, actividades y prueba
}

export interface Material {
  id: string;
  topicId: string;
  title: string;
  type: 'document' | 'video' | 'interactive' | 'pdf' | 'pptx';
  content: string; // Markdown/HTML style training text
  url?: string; // Optional link or video embed URL
  estimatedMinutes: number;
  filePath?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  recursos?: RecursoApoyo[]; // Documentos y enlaces oficiales de apoyo
}

export interface Question {
  id: string;
  topicId: string;
  questionText: string;
  options: string[]; // Options array
  correctOptionIndex: number; // Index of correct option (0, 1, 2, 3)
  type?: 'initial' | 'final'; // Defaults to 'final' if not specified
  format?: 'multiple' | 'true_false';
  points?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  topicId: string;
  topicTitle: string;
  score: number; // 0-10 scale
  answers: { [questionId: string]: number }; // questionId -> chosen index
  passed: boolean;
  takenAt: string;
  durationSeconds: number;
  attemptNumber: number;
  type?: 'initial' | 'final'; // Distinguish between initial and final attempts
}

export interface UserProgress {
  userId: string;
  topicId: string;
  completedMaterialIds: string[]; // materials read
  quizStatus: 'not_started' | 'failed' | 'passed';
  highestScore: number | null;
  attemptsCount: number;
  lastActiveAt: string;
  initialQuizCompleted?: boolean;
  initialQuizScore?: number | null;
  completedAt?: string;
}

export interface CourseReview {
  id: string;
  topicId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  submittedAt: string;
  satisfactionRating?: number; // 0-3 satisfaction
  clarityRating?: number; // 0-3 clarity
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // User ID or 'ALL'
  title: string;
  content: string;
  type: 'automatic_progress' | 'automatic_due_date' | 'manual';
  createdAt: string;
  isRead: boolean;
  topicId?: string;
  readByUserIds?: string[];
}

export interface CertificateTemplate {
  id: string;
  title: string;
  subtitle: string;
  bodyText: string;
  signatureName: string;
  signatureRole: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
}



// ============================================================================
// EXTENSIONES: CUMPLIMIENTO MDT-2025-006 (40 HORAS) Y LOPDP
// ============================================================================
export type EjeMdt = 'derechos' | 'genero' | 'violencia' | 'igual_valor' | 'otro';

export const EJES_MDT: Record<EjeMdt, string> = {
  derechos: 'Derechos laborales de mujeres y hombres',
  genero: 'Igualdad de género',
  violencia: 'Erradicación de la violencia y no discriminación',
  igual_valor: 'Trabajo de igual valor',
  otro: 'Inclusión y cultura de respeto',
};

/** Tiempo efectivo de estudio acumulado por usuario, curso, material y día. */
export interface TiempoEstudio {
  id: string; // `${userId}|${materialId}|${fecha}`
  userId: string;
  topicId: string;
  materialId: string;
  fecha: string; // YYYY-MM-DD (hora de Ecuador)
  segundos: number;
  primerRegistro: string;
  ultimoRegistro: string;
}

export interface SesionPresencial {
  id: string;
  tema: string;
  eje: EjeMdt;
  fecha: string; // YYYY-MM-DD
  horas: number;
  facilitador: string;
  lugar: string;
  asistentes: string[]; // IDs de usuario
  creadoPor: string;
  creadoAt: string;
}

export interface CertificadoEmitido {
  codigo: string; // FZ-2026-XXXXXXXX
  userId: string;
  userName: string;
  cedula: string;
  topicId: string; // ID del curso o 'PLAN-<año>' para el certificado anual de 40 h
  titulo: string;
  horas: number;
  emitidoAt: string;
}

export interface RegistroAuditoria {
  id: string;
  userId: string;
  userName: string;
  accion: string;
  detalle: string;
  at: string;
}

export interface ConfigCumplimiento {
  anio: number;
  horasMinimas: number;
  nombrePlan: string;
}

// ============================================================================
// EXTENSIONES: ACTIVIDADES PRÁCTICAS Y RECURSOS DE APOYO
// ============================================================================
export interface ActividadPractica {
  id: string;
  titulo: string;
  consigna: string; // Instrucción o caso a resolver
  criterios: string; // Criterios de evaluación
  puntos: number; // Puntos que aporta a la nota del módulo (p. ej. 20)
}

export interface RespuestaActividad {
  id: string; // `${userId}|${actividadId}`
  userId: string;
  userName: string;
  topicId: string;
  actividadId: string;
  respuesta: string;
  puntos: number; // Puntos acreditados (automático al enviar; RRHH puede ajustarlos)
  revisadoPor?: string;
  comentarioRevision?: string;
  actualizadoAt: string;
}

export interface RecursoApoyo {
  titulo: string;
  url: string;
}
