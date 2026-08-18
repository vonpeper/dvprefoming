# Modelo de Datos - DV Performing Arts

Este documento describe el esquema lógico de datos para la base de datos PostgreSQL, alineado con el ORM Prisma.

## 1. Diseño Lógico de Entidades (Prisma Schema Concept)

```prisma
// Esquema conceptual de base de datos futura

enum EntityStatus {
  DRAFT
  PLACEHOLDER
  PENDING_CLIENT_INPUT
  PUBLISHED
}

enum AuditionStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED
  DRAFT
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

model User {
  id            String             @id @default(uuid())
  email         String             @unique
  passwordHash  String
  role          UserRole           @default(STUDENT)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  studentProfile StudentProfile?
  teacherProfile TeacherProfile?
  activities    AdminActivityLog[]
}

model StudentProfile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  fullName  String
  phone     String?
  birthDate DateTime?
}

model TeacherProfile {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  fullName    String
  slug        String    @unique
  bio         String
  specialties String[]
  status      EntityStatus @default(DRAFT)
}

model Program {
  id                 String               @id @default(uuid())
  slug               String               @unique
  name               String
  description        String
  ageGroup           String
  scheduleDescription String
  status             EntityStatus         @default(DRAFT)
  auditions          AuditionRegistration[]
}

model Production {
  id              String       @id @default(uuid())
  slug            String       @unique
  title           String
  synopsis        String
  director        String
  castDescription String
  durationMinutes Int
  status          EntityStatus @default(DRAFT)
}

model AuditionRegistration {
  id              String         @id @default(uuid())
  folio           String         @unique
  fullName        String
  email           String
  phone           String
  birthDate       DateTime
  programId       String
  program         Program        @relation(fields: [programId], references: [id])
  experienceNotes String
  status          AuditionStatus @default(PENDING_REVIEW)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model AdminActivityLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // e.g. "APPROVED_AUDITION"
  details   Json?
  createdAt DateTime @default(now())
}
```

---

## 2. Generación Transaccional de Folios (Audiciones)

> [!IMPORTANT]
> **Regla de Concurrencia y Consistencia:** Queda estrictamente prohibido generar folios de audición realizando una consulta previa para contar los registros existentes (ej. `count() + 1`). Esto produce condiciones de carrera bajo alta concurrencia (dos usuarios obteniendo el mismo número de folio).
>
> Los folios se generarán utilizando secuencias de base de datos a nivel transaccional (ej. `SEQUENCE` en PostgreSQL) o mediante bloqueos optimistas/pesimistas controlados en una tabla de contadores atómicos independientes, garantizando la unicidad absoluta de cada folio.

## 3. Seguridad y Bitácora de Auditoría
Toda acción administrativa (aprobación de audición, cambio de estados en clases, modificación del CMS) deberá registrarse en el modelo `AdminActivityLog` asociando el ID del usuario administrativo que realizó el cambio, la acción concreta y los datos previos/posteriores en formato JSON.
