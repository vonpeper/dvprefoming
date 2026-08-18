/**
 * TypeScript definitions for DV Performing Arts technical baseline.
 * Designed to align with a future PostgreSQL & Prisma schema.
 */

export type EntityStatus = "DRAFT" | "PLACEHOLDER" | "PENDING_CLIENT_INPUT" | "PUBLISHED";

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  ageGroup: string; // e.g. "Niños", "Jóvenes", "Adultos"
  scheduleDescription: string; // e.g. "Lunes y Miércoles 17:00 - 19:00"
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  slug: string;
  fullName: string;
  bio: string;
  specialties: string[]; // e.g. ["Danza Clásica", "Teatro Musical"]
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
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditionRegistration {
  id: string;
  folio: string; // Structured sequence string, generated transactionally in the future
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  programId: string; // Reference to Program.id
  experienceNotes: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT";
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string; // Rich-text or markdown body from Manifiesto 21
  excerpt: string;
  authorName: string;
  publishedAt: Date | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}
