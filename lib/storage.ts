import fs from "fs";
import path from "path";
import { AuditionRegistration, Article, Program, Teacher, Production, EvaluationCriteria, AuditionScore, EvaluationDiscipline } from "@/types/mock";
import { mockAuditions, mockArticles, mockPrograms, mockTeachers, mockProductions } from "@/data/mock";

const DATA_DIR = path.join(process.cwd(), ".data");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Auditions Storage & Relational Integrity Normalizer
// ---------------------------------------------------------------------------
const AUDITIONS_FILE = path.join(DATA_DIR, "auditions.json");

export function normalizeAuditionRecord(
  aud: AuditionRegistration,
  productions: Production[]
): AuditionRegistration {
  // 1. Relational Integrity: Production linkage
  let matchedProd = productions.find(
    (p) => p.id === aud.productionId || p.title === aud.productionName
  );
  if (!matchedProd) {
    matchedProd = productions.find((p) => p.isAuditionActive) || productions[0];
  }

  // 2. Ensure short folio & audition number
  let folio = aud.folio || "";
  let auditionNumber = aud.auditionNumber;
  if (!folio.startsWith("DV-") && !folio.startsWith("dv-")) {
    const numericPart = folio.replace(/\D/g, "");
    if (numericPart) {
      const num = parseInt(numericPart, 10) || 585;
      folio = `DV-${num}`;
      auditionNumber = String(num);
    } else {
      folio = "DV-585";
      auditionNumber = "585";
    }
  } else {
    auditionNumber = folio.replace(/\D/g, "") || "585";
  }

  // 3. Status and Assigned Role consistency
  let status = aud.status || "PENDING_REVIEW";
  if (aud.assignedRole && aud.assignedRole.trim() && status !== "APPROVED") {
    status = "APPROVED";
  }

  // 4. Averages recalculation from individual scores
  const scores = aud.scores || [];
  let cantoAverage = aud.cantoAverage;
  let danceAverage = aud.danceAverage;
  let actingAverage = aud.actingAverage;
  let overallScore = aud.overallScore;

  if (scores.length > 0) {
    const cantoScores = scores.filter((s) => s.discipline === "CANTO");
    const danceScores = scores.filter((s) => s.discipline === "COREOGRAFIA");
    const actingScores = scores.filter((s) => s.discipline === "ACTUACION");

    if (cantoScores.length > 0) {
      cantoAverage = Number((cantoScores.reduce((a, b) => a + b.averageScore, 0) / cantoScores.length).toFixed(2));
    }
    if (danceScores.length > 0) {
      danceAverage = Number((danceScores.reduce((a, b) => a + b.averageScore, 0) / danceScores.length).toFixed(2));
    }
    if (actingScores.length > 0) {
      actingAverage = Number((actingScores.reduce((a, b) => a + b.averageScore, 0) / actingScores.length).toFixed(2));
    }

    const discAverages: number[] = [];
    if (cantoAverage !== undefined && cantoAverage > 0) discAverages.push(cantoAverage);
    if (danceAverage !== undefined && danceAverage > 0) discAverages.push(danceAverage);
    if (actingAverage !== undefined && actingAverage > 0) discAverages.push(actingAverage);

    if (discAverages.length > 0) {
      overallScore = Number((discAverages.reduce((a, b) => a + b, 0) / discAverages.length).toFixed(2));
    }
  }

  return {
    ...aud,
    folio,
    auditionNumber,
    productionId: matchedProd?.id || "prod_si_no_es_ahora",
    productionName: matchedProd?.title || "Si No Es Ahora (El Musical)",
    programId: aud.programId || "prog_teatro_musical",
    programName: aud.programName || "Teatro Musical Integral",
    status,
    cantoAverage,
    danceAverage,
    actingAverage,
    overallScore,
  };
}

export function getStoredAuditions(): AuditionRegistration[] {
  ensureDirectoryExists();
  const productions = getStoredProductions();

  if (!fs.existsSync(AUDITIONS_FILE)) {
    const normalized = mockAuditions.map((a) => normalizeAuditionRecord(a, productions));
    saveStoredAuditions(normalized);
    return normalized;
  }
  try {
    const raw = fs.readFileSync(AUDITIONS_FILE, "utf-8");
    const parsed: AuditionRegistration[] = JSON.parse(raw);
    return parsed.map((a) => normalizeAuditionRecord(a, productions));
  } catch {
    return mockAuditions.map((a) => normalizeAuditionRecord(a, productions));
  }
}

export function saveStoredAuditions(auditions: AuditionRegistration[]) {
  ensureDirectoryExists();
  fs.writeFileSync(AUDITIONS_FILE, JSON.stringify(auditions, null, 2), "utf-8");
}

export function createAudition(data: Omit<AuditionRegistration, "id" | "folio" | "createdAt" | "updatedAt">): AuditionRegistration {
  const auditions = getStoredAuditions();
  const productions = getStoredProductions();

  // Validate or assign active production
  const matchedProd = productions.find(
    (p) => p.id === data.productionId || p.title === data.productionName || p.isAuditionActive
  ) || productions[0];

  const nextNum = 500 + auditions.length + 1;
  const folio = `DV-${nextNum}`;

  const newRecord: AuditionRegistration = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    folio,
    auditionNumber: String(nextNum),
    ...data,
    productionId: matchedProd?.id || "prod_si_no_es_ahora",
    productionName: matchedProd?.title || "Si No Es Ahora (El Musical)",
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
  const cleanQuery = query.trim().toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "dv585" or "585"
  const numericOnly = query.replace(/\D/g, "");

  return (
    auditions.find((a) => {
      if (!a) return false;
      const cleanFolio = (a.folio || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // Direct or normalized match (e.g. "DV-585", "dv585", "585")
      if (cleanFolio && (cleanFolio === cleanQuery || cleanFolio.includes(cleanQuery) || cleanQuery.includes(cleanFolio))) {
        return true;
      }
      // Numeric matching (e.g. typing "585" matches "DV-585" or "AUD-2026-DV-0585")
      if (numericOnly && (cleanFolio.includes(numericOnly) || String(a.auditionNumber || "").includes(numericOnly))) {
        return true;
      }
      // Email match
      if (a.email && a.email.toLowerCase().includes(query.trim().toLowerCase())) {
        return true;
      }
      // Phone match
      if (numericOnly && a.phone && a.phone.replace(/\D/g, "").includes(numericOnly)) {
        return true;
      }
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
// Teachers & Faculty Storage (Connected to Judges & Portal)
// ---------------------------------------------------------------------------
export function getStoredTeachers(): Teacher[] {
  const content = getStoredWebsiteContent();
  return content.teachers && content.teachers.length > 0 ? content.teachers : mockTeachers;
}

export function saveStoredTeachers(teachers: Teacher[]) {
  const content = getStoredWebsiteContent();
  content.teachers = teachers;
  saveStoredWebsiteContent(content);
}

export function inferTeacherDiscipline(teacher: Teacher): EvaluationDiscipline {
  const specs = (teacher.specialties || []).join(" ").toLowerCase();
  const text = `${teacher.fullName} ${specs} ${teacher.bio || ""}`.toLowerCase();

  // 1. Vocal / Singing takes precedence if in specialties or specific keywords
  if (specs.includes("vocal") || specs.includes("canto") || specs.includes("ópera") || specs.includes("lírico") || specs.includes("música")) {
    return "CANTO";
  }

  // 2. Dance / Choreography
  if (text.includes("danza") || text.includes("baile") || text.includes("coreograf") || text.includes("hip hop") || text.includes("jazz") || text.includes("urbano")) {
    return "COREOGRAFIA";
  }

  // 3. Acting / Stage Direction
  if (text.includes("actua") || text.includes("teatro") || text.includes("escén") || text.includes("interpret") || text.includes("dirección") || text.includes("texto")) {
    return "ACTUACION";
  }

  return "CANTO";
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

// ---------------------------------------------------------------------------
// Evaluation Criteria (Rubrics) & Audition Scores Storage
// ---------------------------------------------------------------------------
const CRITERIA_FILE = path.join(DATA_DIR, "evaluation-criteria.json");

export const DEFAULT_EVALUATION_CRITERIA: EvaluationCriteria[] = [
  // Canto
  { id: "c_tesitura", discipline: "CANTO", name: "Tesitura", description: "Rango, extensión vocal y comodidad en agudos/graves", maxScore: 10, order: 1 },
  { id: "c_afinacion", discipline: "CANTO", name: "Afinación", description: "Precisión tonal, oído armónico y afinación en intervalos", maxScore: 10, order: 2 },
  { id: "c_proyeccion", discipline: "CANTO", name: "Proyección", description: "Potencia, resonancia y llegada del sonido sin tensión", maxScore: 10, order: 3 },
  { id: "c_diccion", discipline: "CANTO", name: "Dicción", description: "Claridad en la articulación de vocales y consonantes", maxScore: 10, order: 4 },

  // Actuación
  { id: "a_interpretacion", discipline: "ACTUACION", name: "Interpretación", description: "Construcción del personaje, verdad y credibilidad escénica", maxScore: 10, order: 1 },
  { id: "a_presencia", discipline: "ACTUACION", name: "Presencia Escénica", description: "Seguridad, magnetismo y dominio del espacio", maxScore: 10, order: 2 },
  { id: "a_creatividad", discipline: "ACTUACION", name: "Creatividad", description: "Propuesta actoral, espontaneidad y toma de riesgos", maxScore: 10, order: 3 },
  { id: "a_naturalidad", discipline: "ACTUACION", name: "Naturalidad", description: "Organicidad, fluidez y escucha activa con el texto", maxScore: 10, order: 4 },

  // Danza / Coreografía
  { id: "d_tecnica", discipline: "COREOGRAFIA", name: "Técnica", description: "Alineación corporal, colocación, limpieza y ejecución", maxScore: 10, order: 1 },
  { id: "d_memoria", discipline: "COREOGRAFIA", name: "Memoria", description: "Velocidad de retención de pasos y secuencias coreográficas", maxScore: 10, order: 2 },
  { id: "d_expresion", discipline: "COREOGRAFIA", name: "Expresión Corporal", description: "Proyección emocional, carisma y gestualidad en el baile", maxScore: 10, order: 3 },
  { id: "d_energia", discipline: "COREOGRAFIA", name: "Energía", description: "Fuerza, dinamismo, ritmo y ataque del movimiento", maxScore: 10, order: 4 },
];

export function getStoredCriteria(): EvaluationCriteria[] {
  ensureDirectoryExists();
  if (!fs.existsSync(CRITERIA_FILE)) {
    saveStoredCriteria(DEFAULT_EVALUATION_CRITERIA);
    return DEFAULT_EVALUATION_CRITERIA;
  }
  try {
    const raw = fs.readFileSync(CRITERIA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EVALUATION_CRITERIA;
  }
}

export function saveStoredCriteria(criteria: EvaluationCriteria[]) {
  ensureDirectoryExists();
  fs.writeFileSync(CRITERIA_FILE, JSON.stringify(criteria, null, 2), "utf-8");
}

export function saveCriteria(
  criteria: Partial<EvaluationCriteria> & { name: string; discipline: EvaluationDiscipline }
): EvaluationCriteria {
  const allCriteria = getStoredCriteria();
  if (criteria.id) {
    const idx = allCriteria.findIndex((c) => c.id === criteria.id);
    if (idx !== -1) {
      allCriteria[idx] = {
        ...allCriteria[idx],
        ...criteria,
      } as EvaluationCriteria;
      saveStoredCriteria(allCriteria);
      return allCriteria[idx];
    }
  }

  const newId = `crit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newCriteria: EvaluationCriteria = {
    id: newId,
    name: criteria.name,
    discipline: criteria.discipline,
    description: criteria.description || "",
    maxScore: criteria.maxScore || 10,
    order: (criteria.order || allCriteria.filter((c) => c.discipline === criteria.discipline).length + 1),
  };

  allCriteria.push(newCriteria);
  saveStoredCriteria(allCriteria);
  return newCriteria;
}

export function deleteCriteria(id: string): boolean {
  const allCriteria = getStoredCriteria();
  const filtered = allCriteria.filter((c) => c.id !== id);
  if (filtered.length !== allCriteria.length) {
    saveStoredCriteria(filtered);
    return true;
  }
  return false;
}

export function saveAuditionScore(data: {
  auditionId: string;
  judgeName: string;
  judgeTitle?: string;
  discipline: EvaluationDiscipline;
  scores: Record<string, number>;
  judgeNotes?: string;
}): AuditionScore | null {
  const auditions = getStoredAuditions();
  const idx = auditions.findIndex((a) => a.id === data.auditionId || a.folio === data.auditionId);
  if (idx === -1) return null;

  const audition = auditions[idx];
  const existingScores = audition.scores || [];

  // Calculate average of provided rubric scores (0-10)
  const scoreValues = Object.values(data.scores);
  const total = scoreValues.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const averageScore = scoreValues.length > 0 ? Number((total / scoreValues.length).toFixed(2)) : 0;

  const scoreEntry: AuditionScore = {
    id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    auditionId: audition.id,
    judgeName: data.judgeName,
    judgeTitle: data.judgeTitle || "Juez Evaluador",
    discipline: data.discipline,
    scores: data.scores,
    averageScore,
    judgeNotes: data.judgeNotes || "",
    createdAt: new Date(),
  };

  // Replace score if same judge & discipline exists, or push new
  const existingIdx = existingScores.findIndex(
    (s) => s.judgeName === data.judgeName && s.discipline === data.discipline
  );
  if (existingIdx !== -1) {
    existingScores[existingIdx] = scoreEntry;
  } else {
    existingScores.push(scoreEntry);
  }

  audition.scores = existingScores;

  // Recompute discipline averages and overall score
  const cantoScores = existingScores.filter((s) => s.discipline === "CANTO");
  const danceScores = existingScores.filter((s) => s.discipline === "COREOGRAFIA");
  const actingScores = existingScores.filter((s) => s.discipline === "ACTUACION");

  if (cantoScores.length > 0) {
    audition.cantoAverage = Number(
      (cantoScores.reduce((acc, curr) => acc + curr.averageScore, 0) / cantoScores.length).toFixed(2)
    );
  }

  if (danceScores.length > 0) {
    audition.danceAverage = Number(
      (danceScores.reduce((acc, curr) => acc + curr.averageScore, 0) / danceScores.length).toFixed(2)
    );
  }

  if (actingScores.length > 0) {
    audition.actingAverage = Number(
      (actingScores.reduce((acc, curr) => acc + curr.averageScore, 0) / actingScores.length).toFixed(2)
    );
  }

  // Overall average across available disciplines
  const activeAverages: number[] = [];
  if (audition.cantoAverage !== undefined) activeAverages.push(audition.cantoAverage);
  if (audition.danceAverage !== undefined) activeAverages.push(audition.danceAverage);
  if (audition.actingAverage !== undefined) activeAverages.push(audition.actingAverage);

  if (activeAverages.length > 0) {
    audition.overallScore = Number(
      (activeAverages.reduce((acc, curr) => acc + curr, 0) / activeAverages.length).toFixed(2)
    );
  }

  audition.updatedAt = new Date();
  auditions[idx] = audition;
  saveStoredAuditions(auditions);

  return scoreEntry;
}

export function assignRoleToApplicant(
  auditionId: string,
  assignedRole: string,
  notes?: string
): AuditionRegistration | null {
  const auditions = getStoredAuditions();
  const idx = auditions.findIndex((a) => a.id === auditionId || a.folio === auditionId);
  if (idx === -1) return null;

  const now = new Date();
  auditions[idx] = {
    ...auditions[idx],
    status: "APPROVED",
    assignedRole: assignedRole.trim(),
    roleAssignedAt: now,
    notes: notes !== undefined ? notes : auditions[idx].notes,
    updatedAt: now,
  };

  saveStoredAuditions(auditions);
  return auditions[idx];
}

export interface AuditionStats {
  totalAuditions: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  confirmedCount: number;
  approvalRate: number;
  assignedRolesCount: number;
  averageScores: {
    canto: number;
    dance: number;
    acting: number;
    overall: number;
  };
  byProduction: {
    productionId: string;
    productionName: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    averageScore: number;
    isAuditionActive: boolean;
  }[];
  byJudge: {
    judgeName: string;
    judgeTitle: string;
    evaluationsCount: number;
    disciplines: EvaluationDiscipline[];
    averageScoreGiven: number;
  }[];
  recentActivity: {
    id: string;
    auditionId: string;
    candidateName: string;
    folio: string;
    productionName: string;
    judgeName: string;
    discipline: EvaluationDiscipline;
    averageScore: number;
    createdAt: Date | string;
  }[];
}

export function getAuditionStats(productionFilter?: string): AuditionStats {
  const allAuditions = getStoredAuditions();
  const productions = getStoredProductions();

  const filtered = productionFilter && productionFilter !== "ALL"
    ? allAuditions.filter((a) => a.productionId === productionFilter || a.productionName === productionFilter)
    : allAuditions;

  const totalAuditions = filtered.length;
  const approvedCount = filtered.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = filtered.filter((a) => a.status === "REJECTED").length;
  const confirmedCount = filtered.filter((a) => a.status === "CONFIRMED").length;
  const pendingCount = totalAuditions - approvedCount - rejectedCount;
  const assignedRolesCount = filtered.filter((a) => Boolean(a.assignedRole && a.assignedRole.trim())).length;
  const approvalRate = totalAuditions > 0 ? Number(((approvedCount / totalAuditions) * 100).toFixed(1)) : 0;

  // Compute Averages
  const cantoScores = filtered.filter((a) => a.cantoAverage !== undefined && a.cantoAverage > 0).map((a) => a.cantoAverage!);
  const danceScores = filtered.filter((a) => a.danceAverage !== undefined && a.danceAverage > 0).map((a) => a.danceAverage!);
  const actingScores = filtered.filter((a) => a.actingAverage !== undefined && a.actingAverage > 0).map((a) => a.actingAverage!);
  const overallScores = filtered.filter((a) => a.overallScore !== undefined && a.overallScore > 0).map((a) => a.overallScore!);

  const averageScores = {
    canto: cantoScores.length > 0 ? Number((cantoScores.reduce((a, b) => a + b, 0) / cantoScores.length).toFixed(2)) : 0,
    dance: danceScores.length > 0 ? Number((danceScores.reduce((a, b) => a + b, 0) / danceScores.length).toFixed(2)) : 0,
    acting: actingScores.length > 0 ? Number((actingScores.reduce((a, b) => a + b, 0) / actingScores.length).toFixed(2)) : 0,
    overall: overallScores.length > 0 ? Number((overallScores.reduce((a, b) => a + b, 0) / overallScores.length).toFixed(2)) : 0,
  };

  // By Production
  const byProduction = productions.map((prod) => {
    const prodAuditions = allAuditions.filter(
      (a) => a.productionId === prod.id || a.productionName === prod.title
    );
    const pApproved = prodAuditions.filter((a) => a.status === "APPROVED").length;
    const pRejected = prodAuditions.filter((a) => a.status === "REJECTED").length;
    const pPending = prodAuditions.length - pApproved - pRejected;
    const pScores = prodAuditions.filter((a) => a.overallScore !== undefined && a.overallScore > 0).map((a) => a.overallScore!);
    const pAvg = pScores.length > 0 ? Number((pScores.reduce((a, b) => a + b, 0) / pScores.length).toFixed(2)) : 0;

    return {
      productionId: prod.id,
      productionName: prod.title,
      total: prodAuditions.length,
      approved: pApproved,
      rejected: pRejected,
      pending: pPending,
      averageScore: pAvg,
      isAuditionActive: Boolean(prod.isAuditionActive),
    };
  });

  // By Judge (Extracted from all scores)
  const judgeMap: Record<
    string,
    { judgeName: string; judgeTitle: string; disciplines: Set<EvaluationDiscipline>; scores: number[] }
  > = {};

  const recentActivity: AuditionStats["recentActivity"] = [];

  allAuditions.forEach((aud) => {
    (aud.scores || []).forEach((sc) => {
      const jKey = sc.judgeName.trim();
      if (!judgeMap[jKey]) {
        judgeMap[jKey] = {
          judgeName: sc.judgeName,
          judgeTitle: sc.judgeTitle || "Juez Evaluador",
          disciplines: new Set<EvaluationDiscipline>(),
          scores: [],
        };
      }
      judgeMap[jKey].disciplines.add(sc.discipline);
      judgeMap[jKey].scores.push(sc.averageScore);

      recentActivity.push({
        id: sc.id,
        auditionId: aud.id,
        candidateName: aud.fullName,
        folio: aud.folio,
        productionName: aud.productionName || "Si No Es Ahora",
        judgeName: sc.judgeName,
        discipline: sc.discipline,
        averageScore: sc.averageScore,
        createdAt: sc.createdAt,
      });
    });
  });

  const byJudge = Object.values(judgeMap).map((j) => ({
    judgeName: j.judgeName,
    judgeTitle: j.judgeTitle,
    evaluationsCount: j.scores.length,
    disciplines: Array.from(j.disciplines),
    averageScoreGiven: Number((j.scores.reduce((a, b) => a + b, 0) / j.scores.length).toFixed(2)),
  })).sort((a, b) => b.evaluationsCount - a.evaluationsCount);

  // Sort recent activity descending
  recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    totalAuditions,
    approvedCount,
    rejectedCount,
    pendingCount,
    confirmedCount,
    approvalRate,
    assignedRolesCount,
    averageScores,
    byProduction,
    byJudge,
    recentActivity: recentActivity.slice(0, 15),
  };
}

