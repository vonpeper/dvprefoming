import { Program, Teacher, Production, AuditionRegistration, Article } from "@/types/mock";

const MOCK_DATE = new Date("2026-08-06T12:00:00.000Z");

export const mockPrograms: Program[] = [
  {
    id: "prog_placeholder_1",
    slug: "programa-pendiente-slug-1",
    name: "Programa pendiente de información del cliente A",
    description: "Descripción de programa pendiente de información del cliente.",
    ageGroup: "Grupo de edad pendiente de información",
    scheduleDescription: "Horario de clases pendiente de información",
    status: "PENDING_CLIENT_INPUT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
  {
    id: "prog_placeholder_2",
    slug: "programa-pendiente-slug-2",
    name: "Programa pendiente de información del cliente B",
    description: "Descripción de programa pendiente de información del cliente.",
    ageGroup: "Grupo de edad pendiente de información",
    scheduleDescription: "Horario de clases pendiente de información",
    status: "PENDING_CLIENT_INPUT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: "teacher_placeholder_1",
    slug: "instructor-pendiente-slug-1",
    fullName: "Nombre del instructor pendiente de información",
    bio: "Semblanza del instructor pendiente de información del cliente.",
    specialties: ["Especialidad pendiente de información"],
    status: "PENDING_CLIENT_INPUT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];

export const mockProductions: Production[] = [
  {
    id: "prod_placeholder_1",
    slug: "produccion-pendiente-slug-1",
    title: "Obra o producción pendiente de información",
    synopsis: "Sinopsis de la producción pendiente de información del cliente.",
    director: "Director pendiente de información",
    castDescription: "Elenco pendiente de información",
    durationMinutes: 0,
    status: "PENDING_CLIENT_INPUT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];

export const mockAuditions: AuditionRegistration[] = [
  {
    id: "audition_placeholder_1",
    folio: "AUD-2026-0000-PLACEHOLDER",
    fullName: "Nombre de aspirante pendiente de registro",
    email: "correo.pendiente@ejemplo.com",
    phone: "0000000000",
    birthDate: MOCK_DATE,
    programId: "prog_placeholder_1",
    experienceNotes: "Notas de experiencia del aspirante pendientes",
    status: "DRAFT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];

export const mockArticles: Article[] = [
  {
    id: "article_placeholder_1",
    slug: "articulo-pendiente-slug-1",
    title: "Artículo de blog pendiente de información",
    content: "Contenido completo del artículo editorial pendiente de información del cliente.",
    excerpt: "Resumen del artículo pendiente de información.",
    authorName: "Autor pendiente de información",
    publishedAt: null,
    status: "PENDING_CLIENT_INPUT",
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  },
];
