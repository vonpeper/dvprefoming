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

export function updateAuditionStatus(
  id: string,
  status: AuditionRegistration["status"],
  notes?: string,
  whatsappNotified?: boolean,
  emailNotified?: boolean
): AuditionRegistration | null {
  const auditions = getStoredAuditions();
  const index = auditions.findIndex((a) => a.id === id);
  if (index === -1) return null;

  auditions[index] = {
    ...auditions[index],
    status,
    notes: notes !== undefined ? notes : auditions[index].notes,
    whatsappNotified: whatsappNotified !== undefined ? whatsappNotified : auditions[index].whatsappNotified,
    emailNotified: emailNotified !== undefined ? emailNotified : auditions[index].emailNotified,
    updatedAt: new Date(),
  };

  saveStoredAuditions(auditions);
  return auditions[index];
}

export function getAuditionByFolioOrContact(query: string): AuditionRegistration | null {
  if (!query) return null;
  const auditions = getStoredAuditions();
  const cleanQuery = query.trim().toLowerCase();
  const numericOnly = cleanQuery.replace(/\D/g, "");

  return (
    auditions.find((a) => {
      // Direct Folio match
      if (a.folio && a.folio.toLowerCase() === cleanQuery) return true;
      // Sequence number match (e.g. 585 or 0585)
      if (numericOnly && a.folio && a.folio.includes(numericOnly)) return true;
      // Email match
      if (a.email && a.email.toLowerCase() === cleanQuery) return true;
      // Phone match
      if (numericOnly && a.phone && a.phone.replace(/\D/g, "").includes(numericOnly)) return true;
      return false;
    }) || null
  );
}

// ---------------------------------------------------------------------------
// Notification Settings & Automated Messaging Storage
// ---------------------------------------------------------------------------
const NOTIFICATION_SETTINGS_FILE = path.join(DATA_DIR, "notification-settings.json");

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFrom?: string;
  googleDriveMaterialUrl: string;
  directorSignatureName: string;
  directorSignatureTitle: string;
  templates: {
    registrationEmailSubject: string;
    registrationWhatsappText: string;
    approvalEmailSubject: string;
    approvalWhatsappText: string;
  };
}

export function getNotificationSettings(): NotificationSettings {
  ensureDirectoryExists();
  const defaultSettings: NotificationSettings = {
    emailNotificationsEnabled: true,
    whatsappNotificationsEnabled: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpUser: "contacto@dvperformingarts.com",
    smtpFrom: '"DV Performing Arts" <contacto@dvperformingarts.com>',
    googleDriveMaterialUrl: "https://drive.google.com/drive/folders/1qadnY5yaF1ZXprIXP5NY1cmAJkvQU08C?usp=drive_link",
    directorSignatureName: "Diego Vieyra",
    directorSignatureTitle: "Director General & Artístico",
    templates: {
      registrationEmailSubject: "🎭 Confirmación de Registro a Audición • Folio #{folio} | DV Performing Arts",
      registrationWhatsappText: `🎭 *¡HOLA {nombre}, YA DISTE EL PRIMER PASO!* 🎭\n\nEs hora de preparar la canción que te ayudará a obtener el papel de tus sueños.\n\n📋 *Tu número de audición para "{obra}" es:* \n*{folio}*\n\n💡 *Consejos para el día de la audición:*\n• Prepara una canción de teatro musical o contemporánea (1 minuto de duración).\n• Trae tu pista preparada. Puedes reproducirla desde tu celular.\n• Usa ropa cómoda. Después del canto, hay una audición de baile. *NO tienes que preparar ninguna coreografía previa*.\n• Lleva una botella de agua. Mantente hidratadx con pequeños sorbos.\n• Si estás nerviosx, respira profundo y recuerda que estás haciendo algo que amas.\n• No podrás entrar acompañado, pero te podrán esperar afuera de las instalaciones.\n\n📁 *Encuentra el material para realizar tu audición en este enlace:*\n{drive_link}\n\n🔍 *Consulta tu folio en línea:*\nhttps://prev.dvperformingarts.com/audiciones/consulta?folio={folio}\n\nTodo lo mejor,\n*Director Diego Vieyra*\n*DV Performing Arts*`,
      approvalEmailSubject: "🎉 ¡Audición Exitosa! Has sido Aprobado(a) para \"{obra}\" | DV Performing Arts",
      approvalWhatsappText: `🌟 *¡MUCHAS FELICIDADES {nombre}! TU AUDICIÓN FUE EXITOSA* 🌟\n\nNos complace informarte que has sido *APROBADO(A)* para formar parte del elenco de *"{obra}"* (Folio: *{folio}*).\n\n📋 *Siguientes pasos:*\n1. El equipo de dirección te enviará el llamado para la primera lectura y entrega de libreto.\n2. Inicia tu proceso de enrolamiento en la academia.\n\n💬 Si tienes dudas, contáctanos directamente a este WhatsApp.\n\n¡Bienvenidx a la compañía!\n*Diego Vieyra — Director Artístico*\n*DV Performing Arts*`,
    },
  };

  if (!fs.existsSync(NOTIFICATION_SETTINGS_FILE)) {
    saveNotificationSettings(defaultSettings);
    return defaultSettings;
  }

  try {
    const raw = fs.readFileSync(NOTIFICATION_SETTINGS_FILE, "utf-8");
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  ensureDirectoryExists();
  fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
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

export function getArticleBySlug(slug: string): Article | null {
  const articles = getStoredArticles();
  return articles.find((a) => a.slug === slug || a.id === slug) || null;
}

export function getRelatedArticles(currentId: string, limit = 4): Article[] {
  const articles = getStoredArticles();
  return articles.filter((a) => a.id !== currentId && (a.status || "PUBLISHED") === "PUBLISHED").slice(0, limit);
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
  footer: {
    description: string;
    copyright: string;
    socialLinks: {
      instagram: string;
      facebook: string;
      tiktok: string;
    };
  };
  programs: Program[];
  teachers: Teacher[];
  productions: Production[];
}

export function getStoredWebsiteContent(): WebsiteContent {
  ensureDirectoryExists();
  const defaultFooter = {
    description: "Academia de formación integral en Teatro Musical, Danza Urbana, Canto y Actuación en León, Guanajuato.",
    copyright: "© 2026 DV PERFORMING ARTS. Todos los derechos reservados.",
    socialLinks: {
      instagram: "https://www.instagram.com/dvperformingarts",
      facebook: "https://www.facebook.com/dvperformingarts",
      tiktok: "https://www.tiktok.com/@dvperformingarts",
    },
  };

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
      footer: defaultFooter,
      programs: mockPrograms,
      teachers: mockTeachers,
      productions: mockProductions,
    };
    saveStoredWebsiteContent(initialContent);
    return initialContent;
  }

  try {
    const raw = fs.readFileSync(PAGES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      footer: parsed.footer
        ? {
            ...defaultFooter,
            ...parsed.footer,
            socialLinks: {
              ...defaultFooter.socialLinks,
              ...(parsed.footer.socialLinks || {}),
            },
          }
        : defaultFooter,
    };
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
      footer: defaultFooter,
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
        auditionDeadline: prod.auditionDeadline || "",
        eventDate: prod.eventDate || "",
        venueName: prod.venueName || "Auditorio DV Performing Arts",
        venueAddress: prod.venueAddress || "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
        venueMapsUrl: prod.venueMapsUrl || "",
        ticketUrl: prod.ticketUrl || "",
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
      auditionDeadline: prod.auditionDeadline || "",
      eventDate: prod.eventDate || "",
      venueName: prod.venueName || "Auditorio DV Performing Arts",
      venueAddress: prod.venueAddress || "Paseo de los Insurgentes #1506, Col. Jardines del Moral, León, Gto.",
      venueMapsUrl: prod.venueMapsUrl || "",
      ticketUrl: prod.ticketUrl || "",
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
