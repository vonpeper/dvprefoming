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
  imageUrl?: string;
  productionStatus?: "AUDITIONS_OPEN" | "IN_SEASON" | "UPCOMING" | "ARCHIVED";
  isAuditionActive?: boolean; // If true, this production is the active call for auditions
  auditionDates?: string; // e.g. "Sábados de Marzo 2026"
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditionRegistration {
  id: string;
  folio: string; // Structured sequence string (e.g. AUD-2026-DV-0042)
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string | Date;
  age?: number | string;
  productionId?: string; // Target play e.g. "prod_si_no_es_ahora"
  productionName?: string; // Target play name e.g. "Si No Es Ahora (El Musical)"
  programId: string; // Reference to Program.id
  programName?: string; // e.g. "Teatro Musical Integral"
  preferredSchedule?: string; // e.g. "Turno Vespertino 16:00 - 20:00"
  experienceNotes: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CONFIRMED" | "DRAFT";
  whatsappNotified?: boolean;
  notes?: string;
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
