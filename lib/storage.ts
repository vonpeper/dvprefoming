import fs from "fs";
import path from "path";
import { AuditionRegistration, Article, Program, Teacher, Production } from "@/types/mock";
import { mockAuditions, mockArticles, mockPrograms, mockTeachers, mockProductions } from "@/data/mock";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Auditions Storage
// ---------------------------------------------------------------------------
const AUDITIONS_FILE = path.join(DATA_DIR, "auditions.json");

export function getStoredAuditions(): AuditionRegistration[] {
  ensureDirectoryExists();
  if (!fs.existsSync(AUDITIONS_FILE)) {
    saveStoredAuditions(mockAuditions);
    return mockAuditions;
  }
  try {
    const raw = fs.readFileSync(AUDITIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return mockAuditions;
  }
}

export function saveStoredAuditions(auditions: AuditionRegistration[]) {
  ensureDirectoryExists();
  fs.writeFileSync(AUDITIONS_FILE, JSON.stringify(auditions, null, 2), "utf-8");
}

export function createAudition(data: Omit<AuditionRegistration, "id" | "folio" | "createdAt" | "updatedAt">): AuditionRegistration {
  const auditions = getStoredAuditions();
  const currentYear = new Date().getFullYear();
  const nextSequence = auditions.length + 1;
  const paddedSequence = String(nextSequence).padStart(4, "0");
  const folio = `AUD-${currentYear}-DV-${paddedSequence}`;

  const newRecord: AuditionRegistration = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    folio,
    ...data,
    status: data.status || "PENDING_REVIEW",
    whatsappNotified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  auditions.unshift(newRecord);
  saveStoredAuditions(auditions);
  return newRecord;
}

export function updateAuditionStatus(id: string, status: AuditionRegistration["status"], notes?: string, whatsappNotified?: boolean): AuditionRegistration | null {
  const auditions = getStoredAuditions();
  const index = auditions.findIndex((a) => a.id === id);
  if (index === -1) return null;

  auditions[index] = {
    ...auditions[index],
    status,
    notes: notes !== undefined ? notes : auditions[index].notes,
    whatsappNotified: whatsappNotified !== undefined ? whatsappNotified : auditions[index].whatsappNotified,
    updatedAt: new Date(),
  };

  saveStoredAuditions(auditions);
  return auditions[index];
}

// ---------------------------------------------------------------------------
// Articles & CMS Storage
// ---------------------------------------------------------------------------
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

export function getStoredArticles(): Article[] {
  ensureDirectoryExists();
  if (!fs.existsSync(ARTICLES_FILE)) {
    saveStoredArticles(mockArticles);
    return mockArticles;
  }
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return mockArticles;
  }
}

export function saveStoredArticles(articles: Article[]) {
  ensureDirectoryExists();
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

export function saveArticle(article: Partial<Article> & { title: string }): Article {
  const articles = getStoredArticles();
  const now = new Date();
  
  if (article.id) {
    const idx = articles.findIndex((a) => a.id === article.id);
    if (idx !== -1) {
      articles[idx] = {
        ...articles[idx],
        ...article,
        updatedAt: now,
      } as Article;
      saveStoredArticles(articles);
      return articles[idx];
    }
  }

  // Create new
  const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const newArticle: Article = {
    id: `art_${Date.now()}`,
    slug,
    title: article.title,
    content: article.content || "",
    excerpt: article.excerpt || "",
    authorName: article.authorName || "Redacción DV Performing Arts",
    category: article.category || "Teatro Musical",
    featuredImage: article.featuredImage || "/images/productions/galeria-show.jpg",
    seoTitle: article.seoTitle || article.title,
    seoDescription: article.seoDescription || article.excerpt || "",
    ogImage: article.ogImage || article.featuredImage || "/images/productions/galeria-show.jpg",
    tags: article.tags || ["Artes Escénicas", "León Gto"],
    publishedAt: article.publishedAt || now,
    status: article.status || "PUBLISHED",
    createdAt: now,
    updatedAt: now,
  };

  articles.unshift(newArticle);
  saveStoredArticles(articles);
  return newArticle;
}

export function deleteArticle(id: string): boolean {
  const articles = getStoredArticles();
  const filtered = articles.filter((a) => a.id !== id);
  if (filtered.length !== articles.length) {
    saveStoredArticles(filtered);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Website Content & Sections Storage
// ---------------------------------------------------------------------------
const PAGES_FILE = path.join(DATA_DIR, "pages-content.json");

export interface WebsiteContent {
  hero: {
    badgeText: string;
    headline: string;
    subtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    heroImage: string;
    auditionNotice: string;
  };
  manifesto: {
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  contact: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    hoursWeekday: string;
    hoursSaturday: string;
  };
  programs: Program[];
  teachers: Teacher[];
  productions: Production[];
}

export function getStoredWebsiteContent(): WebsiteContent {
  ensureDirectoryExists();
  if (!fs.existsSync(PAGES_FILE)) {
    const initialContent: WebsiteContent = {
      hero: {
        badgeText: "[ESTUDIO DE ENTRENAMIENTO] • ACTO I",
        headline: "DISCIPLINA\nESCENARIO\nMOVIMIENTO.",
        subtitle: "Academia de Teatro Musical en León, Gto. Teatro, Canto y Danza para formar artistas que transforman a través de la disciplina, el compromiso y la pasión.",
        primaryCtaText: "Ver Programas",
        secondaryCtaText: "Audiciones Abiertas",
        heroImage: "/images/hero/hero-stage.jpg",
        auditionNotice: "Audiciones abiertas para el musical “Si no es ahora”. Inicia tu registro.",
      },
      manifesto: {
        tag: "[DECLARACIÓN] • NUESTRO MANIFIESTO",
        title: "TRANSFORMAMOS A TRAVÉS DEL TEATRO MUSICAL.",
        subtitle: "MISIÓN & FILOSOFÍA EDUCATIVA",
        description: "Enseñamos a nuestros estudiantes que la disciplina, el compromiso y la pasión son los sellos distintivos de una formación escénica exitosa, rigurosa y con propósito en León, Guanajuato.",
        image: "/images/hero/manifesto-rehearsal.jpg",
      },
      contact: {
        address: "Paseo de los Insurgentes #1506, Col. Jardines del Moral, CP 37160, León, Gto.",
        phone: "477 655 8156",
        whatsapp: "477 655 8156",
        email: "contacto@dvperformingarts.com",
        hoursWeekday: "Lunes a Viernes 16:00 - 20:00",
        hoursSaturday: "Sábados 10:00 - 15:00",
      },
      programs: mockPrograms,
      teachers: mockTeachers,
      productions: mockProductions,
    };
    saveStoredWebsiteContent(initialContent);
    return initialContent;
  }

  try {
    const raw = fs.readFileSync(PAGES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      hero: {
        badgeText: "[ESTUDIO DE ENTRENAMIENTO]",
        headline: "DISCIPLINA ESCENARIO MOVIMIENTO",
        subtitle: "Academia de Teatro Musical en León, Gto.",
        primaryCtaText: "Ver Programas",
        secondaryCtaText: "Audiciones Abiertas",
        heroImage: "/images/hero/hero-stage.jpg",
        auditionNotice: "Audiciones abiertas para 'Si no es ahora'",
      },
      manifesto: {
        tag: "NUESTRO MANIFIESTO",
        title: "TRANSFORMAMOS A TRAVÉS DEL TEATRO MUSICAL",
        subtitle: "FILOSOFÍA",
        description: "Disciplina, compromiso y pasión.",
        image: "/images/hero/manifesto-rehearsal.jpg",
      },
      contact: {
        address: "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
        phone: "477 655 8156",
        whatsapp: "477 655 8156",
        email: "contacto@dvperformingarts.com",
        hoursWeekday: "L-V 16:00 - 20:00",
        hoursSaturday: "Sáb 10:00 - 15:00",
      },
      programs: mockPrograms,
      teachers: mockTeachers,
      productions: mockProductions,
    };
  }
}

export function saveStoredWebsiteContent(content: WebsiteContent) {
  ensureDirectoryExists();
  fs.writeFileSync(PAGES_FILE, JSON.stringify(content, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Productions & Cartelera Storage (Connected to Auditions & Home)
// ---------------------------------------------------------------------------
export function getStoredProductions(): Production[] {
  const content = getStoredWebsiteContent();
  // Ensure default productions have status & isAuditionActive flags
  return content.productions.map((p, idx) => ({
    ...p,
    season: p.season || "Temporada 2026",
    productionStatus: p.productionStatus || (idx === 0 ? "AUDITIONS_OPEN" : "IN_SEASON"),
    isAuditionActive: p.isAuditionActive !== undefined ? p.isAuditionActive : idx === 0,
    auditionDates: p.auditionDates || "Convocatoria Abierta",
  }));
}

export function saveProduction(prod: Partial<Production> & { title: string }): Production {
  const content = getStoredWebsiteContent();
  const productions = getStoredProductions();
  const now = new Date();

  // If this production is set as active for auditions, deactivate other productions
  if (prod.isAuditionActive) {
    productions.forEach((p) => {
      p.isAuditionActive = false;
      if (p.productionStatus === "AUDITIONS_OPEN") {
        p.productionStatus = "IN_SEASON";
      }
    });
  }

  let savedProd: Production;

  if (prod.id) {
    const idx = productions.findIndex((p) => p.id === prod.id);
    if (idx !== -1) {
      productions[idx] = {
        ...productions[idx],
        ...prod,
        updatedAt: now,
      } as Production;
      savedProd = productions[idx];
    } else {
      savedProd = {
        id: prod.id,
        slug: prod.slug || prod.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title: prod.title,
        synopsis: prod.synopsis || "",
        director: prod.director || "Diego Vieyra",
        castDescription: prod.castDescription || "Alumnos y elenco de DV Performing Arts",
        durationMinutes: prod.durationMinutes || 120,
        season: prod.season || "Temporada 2026",
        imageUrl: prod.imageUrl || "/images/productions/si-no-es-ahora.jpg",
        productionStatus: prod.productionStatus || (prod.isAuditionActive ? "AUDITIONS_OPEN" : "IN_SEASON"),
        isAuditionActive: prod.isAuditionActive ?? false,
        auditionDates: prod.auditionDates || "Convocatoria Abierta",
        status: "PUBLISHED",
        createdAt: now,
        updatedAt: now,
      };
      productions.unshift(savedProd);
    }
  } else {
    const newId = `prod_${Date.now()}`;
    const slug = prod.slug || prod.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    savedProd = {
      id: newId,
      slug,
      title: prod.title,
      synopsis: prod.synopsis || "",
      director: prod.director || "Diego Vieyra",
      castDescription: prod.castDescription || "Alumnos y elenco de DV Performing Arts",
      durationMinutes: prod.durationMinutes || 120,
      season: prod.season || "Temporada 2026",
      imageUrl: prod.imageUrl || "/images/productions/si-no-es-ahora.jpg",
      productionStatus: prod.productionStatus || (prod.isAuditionActive ? "AUDITIONS_OPEN" : "IN_SEASON"),
      isAuditionActive: prod.isAuditionActive ?? false,
      auditionDates: prod.auditionDates || "Convocatoria Abierta",
      status: "PUBLISHED",
      createdAt: now,
      updatedAt: now,
    };
    productions.unshift(savedProd);
  }

  content.productions = productions;
  saveStoredWebsiteContent(content);
  return savedProd;
}

export function deleteProduction(id: string): boolean {
  const content = getStoredWebsiteContent();
  const productions = getStoredProductions();
  const filtered = productions.filter((p) => p.id !== id);
  if (filtered.length !== productions.length) {
    content.productions = filtered;
    saveStoredWebsiteContent(content);
    return true;
  }
  return false;
}

export function setActiveAuditionProduction(id: string): Production | null {
  const content = getStoredWebsiteContent();
  const productions = getStoredProductions();
  const target = productions.find((p) => p.id === id);
  if (!target) return null;

  productions.forEach((p) => {
    p.isAuditionActive = p.id === id;
    if (p.id === id) {
      p.productionStatus = "AUDITIONS_OPEN";
    }
  });

  content.productions = productions;
  // Also update hero notice text dynamically!
  content.hero.auditionNotice = `Audiciones abiertas para el musical “${target.title}”. Inicia tu registro.`;
  saveStoredWebsiteContent(content);
  return target;
}
