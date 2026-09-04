/**
 * TypeScript definitions for DV Performing Arts technical baseline.
 * Designed to align with a future PostgreSQL & Prisma schema.
 */

export type EntityStatus = "DRAFT" | "PLACEHOLDER" | "PENDING_CLIENT_INPUT" | "PUBLISHED";

export interface Program {
  id: string;
  slug: string;
  name: string;
  category?: string;
  description: string;
  ageGroup: string; // e.g. "Niños", "Jóvenes", "Adultos"
  scheduleDescription: string; // e.g. "Lunes y Miércoles 17:00 - 19:00"
  imageUrl?: string;
  monthlyPrice?: number; // Mensualidad en MXN (ej. 2400)
  registrationFee?: number; // Cuota de inscripción
  stripePriceId?: string; // Stripe Price ID (ej. price_1N...)
  stripePaymentLink?: string; // Enlace directo a Stripe Checkout / Payment Link
  features?: string[];
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  slug: string;
  fullName: string;
  title?: string; // e.g. "Director Fundador & Maestro de Canto"
  bio: string;
  specialties: string[]; // e.g. ["Danza Clásica", "Teatro Musical"]
  imageUrl?: string;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Production {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  director: string;
  castDescription: string;
  durationMinutes: number;
  season?: string; // e.g. "Temporada 2026"
  productionCode?: string; // e.g. "SNEA", "ITW", "HNMPL" Folio/Código Teatral de la Obra
  imageUrl?: string;
  ticketUrl?: string; // Enlace externo al servicio de boletería (Boletópolis, etc.)
  driveFolderUrl?: string; // Enlace a Google Drive con material de audición (pistas, libretos, letras)
  productionStatus?: "AUDITIONS_OPEN" | "IN_SEASON" | "UPCOMING" | "ARCHIVED";
  isAuditionActive?: boolean; // If true, this production is the active call for auditions
  auditionDates?: string; // e.g. "Sábados de Marzo 2026"
  auditionDeadline?: string; // e.g. "2026-11-30" Fecha límite para registrarse a audición
  eventDate?: string; // e.g. "2026-12-15" Fecha de estreno / función
  venueName?: string; // e.g. "Teatro Manuel Doblado" o "Auditorio DV Performing Arts"
  venueAddress?: string; // e.g. "Pedro Moreno esq. Hermanos Aldama, Centro, León, Gto."
  venueMapsUrl?: string; // e.g. "https://maps.app.goo.gl/..." Enlace a Google Maps
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EvaluationDiscipline = "CANTO" | "COREOGRAFIA" | "ACTUACION";

export interface EvaluationCriteria {
  id: string;
  discipline: EvaluationDiscipline;
  name: string;
  description?: string;
  maxScore: number; // default 10
  order?: number;
}

export interface AuditionScore {
  id: string;
  auditionId: string;
  judgeName: string;
  judgeTitle?: string;
  discipline: EvaluationDiscipline;
  scores: Record<string, number>; // { [criteriaId]: score 0-10 }
  averageScore: number; // 0 to 10
  judgeNotes?: string;
  createdAt: Date | string;
}

export type AuditionStatus =
  | "PENDING_REVIEW"
  | "ATTENDED"
  | "APPROVED"
  | "NO_SHOW"
  | "SECOND_CHANCE"
  | "REJECTED"
  | "BLACKLIST"
  | "CONFIRMED"
  | "DRAFT";

export type CastingCategory =
  | "PROTAGONICO"
  | "CO_PROTAGONICO"
  | "CUADRO_PRINCIPAL"
  | "ENSAMBLE"
  | "SWING_COVER"
  | "TALLER_FORMACION";

export interface AuditionRegistration {
  id: string;
  folio: string; // Folio de Convocatoria / Casting Call específico de la obra (e.g. SNEA-585)
  studentFolio?: string; // Folio Único de Estudiante / Artista en DV (e.g. DV-0482)
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string | Date;
  age?: number | string;
  headshotUrl?: string; // Foto oficial o selfie del aspirante tomada desde el móvil
  fullBodyPhotoUrl?: string; // Foto de cuerpo entero para casting
  productionId?: string; // Target play e.g. "prod_si_no_es_ahora"
  productionName?: string; // Target play name e.g. "Si No Es Ahora (El Musical)"
  productionCode?: string; // Código de la obra (e.g. "SNEA")
  googleDriveUrl?: string; // Enlace a Google Drive con material de audición de la obra
  programId: string; // Reference to Program.id
  programName?: string; // e.g. "Teatro Musical Integral"
  preferredSchedule?: string; // e.g. "Turno Vespertino 16:00 - 20:00"
  experienceNotes: string;
  status: AuditionStatus;
  whatsappNotified?: boolean;
  emailNotified?: boolean;
  reminder8amNotifiedAt?: Date | string;
  auditionNumber?: number | string;
  notes?: string;
  studentId?: string; // Identificador correlativo del alumno para historial

  // Ficha Médica & Contacto de Emergencia en Escena / Ensayos
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string; // e.g. "Mamá", "Papá", "Tutor Legal", "Pareja"
  bloodType?: string; // e.g. "O+", "A+", "B+", "AB-", "Desconocido"
  medicalNotes?: string; // Alergias a medicamentos, condiciones físicas o lesiones

  // Perfil Escénico Teatral
  vocalRange?: string; // Tesitura (Soprano, Mezzo, Contralto, Tenor, Barítono, Bajo)
  danceStyles?: string[]; // e.g. ["Jazz Musical", "Ballet", "Hip-Hop / Urbano", "Tap"]
  desiredRole?: string; // Personaje al que aspira en el libreto
  
  // Casting & Scoring fields
  assignedRole?: string; // Personaje o rol asignado (ej. "Benny - Protagónico")
  castingCategory?: CastingCategory; // Clasificación del reparto
  roleAssignedAt?: Date | string;
  scores?: AuditionScore[];
  cantoAverage?: number;
  danceAverage?: number;
  actingAverage?: number;
  overallScore?: number;

  // Pipeline & Lifecycle Fields
  secondChanceDate?: string;
  secondChanceTime?: string;
  secondChanceNotifiedAt?: Date | string;
  blacklistReason?: string;
  blacklistDate?: Date | string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string; // Structured blocks JSON or HTML
  excerpt: string;
  authorName: string;
  category?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  tags?: string[];
  keywords?: string[] | string;
  readTimeMinutes?: number;
  publishedAt: Date | string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "ALUMNO" | "ADMIN" | "MAESTRO" | "DOCENTE_JUEZ" | "EDITOR";

export interface UserAccount {
  id: string;
  username: string; // Email o nombre de usuario para inicio de sesión
  phone?: string; // Teléfono / WhatsApp para inicio de sesión y notificaciones del jurado
  fullName: string;
  role: UserRole;
  isJuror?: boolean; // Asignado exclusivamente por el Admin (Solo aplica a Maestro o Admin)
  password?: string;
  title?: string; // e.g. "Director General", "Maestro de Danza", "Alumno"
  assignedDiscipline?: EvaluationDiscipline | "ALL"; // Disciplina que califica el docente si es jurado
  attendanceStatus?: "CONFIRMED" | "PENDING" | "DECLINED"; // Confirmación de asistencia como jurado
  attendanceConfirmedAt?: string | Date;
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

