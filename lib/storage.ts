import fs from "fs";
import path from "path";
import {
  AuditionRegistration,
  Article,
  Program,
  Teacher,
  Production,
  EvaluationCriteria,
  AuditionScore,
  EvaluationDiscipline,
  UserAccount,
  UserRole,
} from "@/types/mock";
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

  // Determine production code (e.g. SNEA, ITW, HNMPL)
  let prodCode = aud.productionCode;
  if (!prodCode) {
    const titleLower = (matchedProd?.title || "").toLowerCase();
    if (titleLower.includes("si no es ahora")) prodCode = "SNEA";
    else if (titleLower.includes("woods")) prodCode = "ITW";
    else if (titleLower.includes("levantar")) prodCode = "HNMPL";
    else prodCode = "DV-PROD";
  }

  // 2. Ensure short folio & audition number
  let folio = aud.folio || "";
  let auditionNumber = aud.auditionNumber;
  if (!folio.startsWith("DV-") && !folio.startsWith("dv-") && !folio.includes("-")) {
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

  // 3. Unique Student Folio (Stable across all auditions/productions for this student)
  const cleanPhoneDigits = aud.phone ? aud.phone.replace(/\D/g, "").slice(-10) : "";
  const studentNum = aud.studentId || cleanPhoneDigits.slice(-4) || "0482";
  const studentFolio = aud.studentFolio || `DV-ART-${studentNum.padStart(4, "0")}`;

  // 4. Status and Assigned Role consistency
  let status = aud.status || "PENDING_REVIEW";
  if (aud.assignedRole && aud.assignedRole.trim() && status !== "APPROVED") {
    status = "APPROVED";
  }

  // 5. Averages recalculation from individual scores
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
    studentFolio,
    productionCode: prodCode,
    auditionNumber,
    headshotUrl: aud.headshotUrl || "",
    googleDriveUrl: aud.googleDriveUrl || matchedProd?.driveFolderUrl || "",
    studentId: aud.studentId || cleanPhoneDigits || undefined,
    productionId: matchedProd?.id || "prod_si_no_es_ahora",
    productionName: matchedProd?.title || "Si No Es Ahora (El Musical)",
    programId: aud.programId || "prog_teatro_musical",
    programName: aud.programName || "Teatro Musical Integral",
    emergencyContactName: aud.emergencyContactName || "Contacto Familiar Registrado",
    emergencyContactPhone: aud.emergencyContactPhone || (aud.phone ? `477${aud.phone.replace(/\D/g, "").slice(-7)}` : "4776558156"),
    emergencyContactRelation: aud.emergencyContactRelation || "Madre / Tutor Legal",
    bloodType: aud.bloodType || "O+",
    medicalNotes: aud.medicalNotes || "Sin padecimientos crónicos declarados. Acondicionamiento físico óptimo para alta exigencia coreográfica.",
    vocalRange: aud.vocalRange || "Mezzo-Soprano (Belter)",
    danceStyles: aud.danceStyles || ["Jazz Musical", "Expresión Corporal", "Urbano"],
    desiredRole: aud.desiredRole || "Personaje asignado por Dirección General",
    castingCategory: aud.castingCategory || (aud.assignedRole ? "PROTAGONICO" : "CUADRO_PRINCIPAL"),
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

  const cleanPhoneDigits = data.phone ? data.phone.replace(/\D/g, "").slice(-10) : "";

  const newRecord: AuditionRegistration = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    folio,
    auditionNumber: String(nextNum),
    headshotUrl: data.headshotUrl || "",
    googleDriveUrl: data.googleDriveUrl || matchedProd?.driveFolderUrl || "",
    studentId: data.studentId || cleanPhoneDigits || undefined,
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

  // Auto-mark candidate as ATTENDED if they were in PENDING_REVIEW, NO_SHOW or SECOND_CHANCE and have no assigned role yet
  if (!audition.assignedRole && (audition.status === "PENDING_REVIEW" || audition.status === "NO_SHOW" || audition.status === "SECOND_CHANCE" || !audition.status)) {
    audition.status = "ATTENDED";
  }

  audition.updatedAt = new Date();
  auditions[idx] = audition;
  saveStoredAuditions(auditions);

  return scoreEntry;
}

export function markNoShowsForProduction(productionId?: string): { markedCount: number; updated: AuditionRegistration[] } {
  const auditions = getStoredAuditions();
  let markedCount = 0;

  const updated = auditions.map((a) => {
    const matchesProd = !productionId || productionId === "ALL" || a.productionId === productionId || a.productionName === productionId;
    const hasScores = a.scores && a.scores.length > 0;
    
    // Only candidates who match production, have 0 scores, and are in PENDING_REVIEW or not yet evaluated
    if (matchesProd && !hasScores && (a.status === "PENDING_REVIEW" || !a.status)) {
      markedCount++;
      return {
        ...a,
        status: "NO_SHOW" as const,
        updatedAt: new Date(),
      };
    }
    return a;
  });

  if (markedCount > 0) {
    saveStoredAuditions(updated);
  }

  return { markedCount, updated };
}

export function bulkUpdateAuditionStatus(
  ids: string[],
  newStatus: any,
  metadata?: {
    reason?: string;
    secondChanceDate?: string;
    secondChanceTime?: string;
  }
): { successCount: number } {
  const auditions = getStoredAuditions();
  const idSet = new Set(ids);
  let successCount = 0;
  const now = new Date();

  const updated = auditions.map((a) => {
    if (idSet.has(a.id) || idSet.has(a.folio)) {
      successCount++;
      const item: AuditionRegistration = {
        ...a,
        status: newStatus,
        updatedAt: now,
      };

      if (newStatus === "BLACKLIST") {
        item.blacklistReason = metadata?.reason || "Inasistencia reiterada / vetado de audición";
        item.blacklistDate = now;
      } else if (newStatus === "SECOND_CHANCE") {
        if (metadata?.secondChanceDate) item.secondChanceDate = metadata.secondChanceDate;
        if (metadata?.secondChanceTime) item.secondChanceTime = metadata.secondChanceTime;
        item.secondChanceNotifiedAt = now;
      }

      return item;
    }
    return a;
  });

  if (successCount > 0) {
    saveStoredAuditions(updated);
  }

  return { successCount };
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

export function updateAuditionTechnicalDossier(
  auditionId: string,
  data: Partial<AuditionRegistration>
): AuditionRegistration | null {
  const auditions = getStoredAuditions();
  const idx = auditions.findIndex((a) => a.id === auditionId || a.folio === auditionId);
  if (idx === -1) return null;

  const now = new Date();
  auditions[idx] = {
    ...auditions[idx],
    ...data,
    updatedAt: now,
  };

  saveStoredAuditions(auditions);
  return auditions[idx];
}


export interface AuditionStats {
  totalAuditions: number;
  approvedCount: number;
  attendedCount: number;
  pendingCount: number;
  noShowCount: number;
  secondChanceCount: number;
  rejectedCount: number;
  blacklistCount: number;
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
    attended: number;
    noShow: number;
    secondChance: number;
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
  const attendedCount = filtered.filter((a) => a.status === "ATTENDED" || (a.scores && a.scores.length > 0 && a.status !== "APPROVED" && a.status !== "BLACKLIST")).length;
  const noShowCount = filtered.filter((a) => a.status === "NO_SHOW").length;
  const secondChanceCount = filtered.filter((a) => a.status === "SECOND_CHANCE").length;
  const rejectedCount = filtered.filter((a) => a.status === "REJECTED").length;
  const blacklistCount = filtered.filter((a) => a.status === "BLACKLIST").length;
  const confirmedCount = filtered.filter((a) => a.status === "CONFIRMED").length;
  const pendingCount = filtered.filter((a) => a.status === "PENDING_REVIEW" || !a.status).length;
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
    const pApproved = prodAuditions.filter((a) => a.status === "APPROVED" || Boolean(a.assignedRole)).length;
    const pAttended = prodAuditions.filter((a) => a.status === "ATTENDED" || (a.scores && a.scores.length > 0)).length;
    const pNoShow = prodAuditions.filter((a) => a.status === "NO_SHOW").length;
    const pSecondChance = prodAuditions.filter((a) => a.status === "SECOND_CHANCE").length;
    const pRejected = prodAuditions.filter((a) => a.status === "REJECTED").length;
    const pBlacklist = prodAuditions.filter((a) => a.status === "BLACKLIST").length;
    const pPending = prodAuditions.filter((a) => a.status === "PENDING_REVIEW" || !a.status).length;
    const pScores = prodAuditions.filter((a) => a.overallScore !== undefined && a.overallScore > 0).map((a) => a.overallScore!);
    const pAvg = pScores.length > 0 ? Number((pScores.reduce((a, b) => a + b, 0) / pScores.length).toFixed(2)) : 0;

    return {
      productionId: prod.id,
      productionName: prod.title,
      total: prodAuditions.length,
      approved: pApproved,
      attended: pAttended,
      noShow: pNoShow,
      secondChance: pSecondChance,
      rejected: pRejected,
      blacklist: pBlacklist,
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
    attendedCount,
    noShowCount,
    secondChanceCount,
    rejectedCount,
    blacklistCount,
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

// ---------------------------------------------------------------------------
// User Accounts & Authentication Storage
// ---------------------------------------------------------------------------
const USERS_FILE = path.join(DATA_DIR, "users.json");

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr_admin_master",
    username: "admin@dvperformingarts.com",
    phone: "4776558156",
    fullName: "Diego Vieyra",
    role: "ADMIN",
    isJuror: true,
    password: process.env.ADMIN_PASSWORD || "DVPerforming@2026!Admin",
    title: "Director General & Fundador",
    assignedDiscipline: "ALL",
    attendanceStatus: "CONFIRMED",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_alek_aguilar",
    username: "alek@dvperformingarts.com",
    phone: "4772494283",
    fullName: "Alek Aguilar",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Danza",
    assignedDiscipline: "COREOGRAFIA",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_alvaro_diaz",
    username: "alvaro@dvperformingarts.com",
    phone: "4771681936",
    fullName: "Alvaro Diaz",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Canto",
    assignedDiscipline: "CANTO",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_andres_rodriguez",
    username: "andres@dvperformingarts.com",
    phone: "4772580501",
    fullName: "Andrés Rodríguez",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Actuación",
    assignedDiscipline: "ACTUACION",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_andrea_miranda",
    username: "andrea.miranda@dvperformingarts.com",
    phone: "4775198320",
    fullName: "Andrea Miranda",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Danza",
    assignedDiscipline: "COREOGRAFIA",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_angel_piedra",
    username: "angel@dvperformingarts.com",
    phone: "4772275573",
    fullName: "Angel Piedra",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Actuación",
    assignedDiscipline: "ACTUACION",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_camila_velasco",
    username: "camila@dvperformingarts.com",
    phone: "4774046134",
    fullName: "Camila Velasco",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Canto, Actuación y Danza",
    assignedDiscipline: "ALL",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_caro_torres",
    username: "caro.torres@dvperformingarts.com",
    phone: "4773929269",
    fullName: "Caro Torres",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Canto",
    assignedDiscipline: "CANTO",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_fanny_monroy",
    username: "fanny@dvperformingarts.com",
    phone: "4761100472",
    fullName: "Fanny Monroy",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Danza",
    assignedDiscipline: "COREOGRAFIA",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_fernanda_velasco",
    username: "fernanda.velasco@dvperformingarts.com",
    phone: "4778274921",
    fullName: "Fernanda Velasco",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Danza",
    assignedDiscipline: "COREOGRAFIA",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_mario_frausto",
    username: "mario.frausto@dvperformingarts.com",
    phone: "4776717680",
    fullName: "Mario Frausto",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Canto",
    assignedDiscipline: "CANTO",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_mauricio_munoz",
    username: "mauricio.munoz@dvperformingarts.com",
    phone: "4771239691",
    fullName: "Mauricio Muñoz",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Actuación",
    assignedDiscipline: "ACTUACION",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_sofia_jaloma",
    username: "sofia.jaloma@dvperformingarts.com",
    phone: "4774039500",
    fullName: "Sofia Jaloma",
    role: "MAESTRO",
    isJuror: false,
    password: "DV@Docente2026",
    title: "Docente de Actuación & Canto",
    assignedDiscipline: "ALL",
    attendanceStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getStoredUsers(): UserAccount[] {
  ensureDirectoryExists();
  if (!fs.existsSync(USERS_FILE)) {
    saveStoredUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed: any[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }

    // Auto-migrate legacy roles if present and normalize
    let needsSave = false;
    const normalized: UserAccount[] = parsed.map((u) => {
      let role: UserRole = u.role;
      let isJuror = u.isJuror;

      if (u.role === "DOCENTE_JUEZ") {
        role = "MAESTRO";
        if (isJuror === undefined) isJuror = true;
        needsSave = true;
      } else if (u.role === "EDITOR") {
        role = "ADMIN";
        needsSave = true;
      } else if (u.role === "MAESTRO" && isJuror === undefined) {
        isJuror = false;
        needsSave = true;
      } else if (u.role === "ADMIN" && isJuror === undefined) {
        isJuror = u.id === "usr_admin_master" || Boolean(u.assignedDiscipline);
        needsSave = true;
      } else if (u.role === "ALUMNO") {
        isJuror = false;
      }

      return {
        ...u,
        role,
        isJuror: Boolean(isJuror),
      };
    });

    // Auto-sync / Merge any missing default teachers from DEFAULT_USERS
    DEFAULT_USERS.forEach((def) => {
      const match = normalized.find((u) => {
        const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, "") : "";
        const defPhoneDigits = def.phone ? def.phone.replace(/\D/g, "") : "";
        const matchPhone = defPhoneDigits && uPhoneDigits.endsWith(defPhoneDigits);
        const matchUser = u.username.toLowerCase() === def.username.toLowerCase();
        const matchName = u.fullName.toLowerCase() === def.fullName.toLowerCase();
        return matchPhone || matchUser || matchName;
      });

      if (!match) {
        normalized.push(def);
        needsSave = true;
      } else {
        // Sync phone if updated in seed
        if (def.phone && (!match.phone || match.phone !== def.phone)) {
          match.phone = def.phone;
          needsSave = true;
        }
        if (!match.assignedDiscipline && def.assignedDiscipline) {
          match.assignedDiscipline = def.assignedDiscipline;
          needsSave = true;
        }
      }
    });

    if (needsSave) {
      saveStoredUsers(normalized);
    }

    return normalized;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: UserAccount[]) {
  ensureDirectoryExists();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function createUser(data: Omit<UserAccount, "id" | "createdAt" | "updatedAt">): UserAccount {
  const users = getStoredUsers();
  const cleanUsername = data.username.trim().toLowerCase();

  // Check if username already exists
  const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    throw new Error(`El usuario o correo "${data.username}" ya está registrado.`);
  }

  const role: UserRole = data.role || "MAESTRO";
  const isJuror = role === "ALUMNO" ? false : Boolean(data.isJuror);

  const now = new Date().toISOString();
  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    phone: data.phone?.trim() || "",
    fullName: data.fullName.trim(),
    role,
    isJuror,
    password: data.password || "DV@User2026",
    title: data.title?.trim() || (role === "ALUMNO" ? "Alumno DV" : role === "MAESTRO" ? "Docente / Maestro" : "Administrador"),
    assignedDiscipline: isJuror ? (data.assignedDiscipline || (role === "ADMIN" ? "ALL" : "CANTO")) : undefined,
    attendanceStatus: isJuror ? (data.attendanceStatus || "PENDING") : undefined,
    status: data.status || "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  saveStoredUsers(users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const current = users[index];

  // If changing username, check uniqueness
  if (updates.username && updates.username.trim().toLowerCase() !== current.username.toLowerCase()) {
    const cleanUsername = updates.username.trim().toLowerCase();
    const clash = users.find((u) => u.id !== id && u.username.toLowerCase() === cleanUsername);
    if (clash) {
      throw new Error(`El usuario o correo "${updates.username}" ya pertenece a otra cuenta.`);
    }
    updates.username = cleanUsername;
  }

  // Handle isJuror constraint for Alumno
  const finalRole = updates.role !== undefined ? updates.role : current.role;
  let finalIsJuror = updates.isJuror !== undefined ? updates.isJuror : current.isJuror;
  if (finalRole === "ALUMNO") {
    finalIsJuror = false;
  }

  const updated: UserAccount = {
    ...current,
    ...updates,
    role: finalRole,
    isJuror: Boolean(finalIsJuror),
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  saveStoredUsers(users);
  return updated;
}

export function deleteUser(id: string): boolean {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return false;

  // Prevent deleting the primary admin account
  if (target.role === "ADMIN" && users.filter((u) => u.role === "ADMIN" && u.status === "ACTIVE").length <= 1) {
    throw new Error("No es posible eliminar al único Administrador General activo.");
  }

  const filtered = users.filter((u) => u.id !== id);
  saveStoredUsers(filtered);
  return true;
}

export function authenticateStoredUser(
  usernameInput: string,
  passInput: string
): { success: boolean; user?: UserAccount } {
  const cleanInput = usernameInput.trim().toLowerCase();
  const rawNumeric = cleanInput.replace(/\D/g, "");
  const masterUser = (process.env.ADMIN_USER || "admin@dvperformingarts.com").toLowerCase();
  const masterPass = process.env.ADMIN_PASSWORD || "DVPerforming@2026!Admin";

  // 1. Check default master admin
  if ((cleanInput === masterUser || cleanInput === "admin" || (rawNumeric.length >= 10 && "4776558156".includes(rawNumeric))) && passInput === masterPass) {
    return {
      success: true,
      user: {
        id: "usr_admin_master",
        username: masterUser,
        phone: "4776558156",
        fullName: "Diego Vieyra",
        role: "ADMIN",
        status: "ACTIVE",
        title: "Director General & Fundador",
        assignedDiscipline: "ALL",
        attendanceStatus: "CONFIRMED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  // 2. Check stored users by username OR by phone number (WhatsApp)
  try {
    const users = getStoredUsers();
    const found = users.find((u) => {
      if (u.status !== "ACTIVE") return false;
      const uUser = u.username.toLowerCase();
      // Match username or email
      if (uUser === cleanInput || (!cleanInput.includes("@") && uUser.startsWith(cleanInput))) {
        return true;
      }
      // Match phone number (last 10 digits)
      if (rawNumeric.length >= 7 && u.phone) {
        const uPhoneDigits = u.phone.replace(/\D/g, "");
        if (uPhoneDigits.endsWith(rawNumeric) || rawNumeric.endsWith(uPhoneDigits)) {
          return true;
        }
      }
      return false;
    });

    if (found && found.password && found.password === passInput) {
      found.lastLogin = new Date().toISOString();
      saveStoredUsers(users);
      return { success: true, user: found };
    }
  } catch (err) {
    console.error("[STORAGE AUTH ERROR]", err);
  }

  return { success: false };
}

/**
 * Searches and returns all audition history grouped for a student / candidate
 */
export function getStudentAuditionsHistory(query: string): {
  candidate: {
    fullName: string;
    phone: string;
    email: string;
    studentId?: string;
    studentFolio?: string;
    headshotUrl?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    bloodType?: string;
    medicalNotes?: string;
    vocalRange?: string;
    danceStyles?: string[];
    desiredRole?: string;
    age?: number | string;
    birthDate?: string | Date;
    experienceNotes?: string;
  };
  totalAuditions: number;
  history: AuditionRegistration[];
}[] {
  const auditions = getStoredAuditions();
  const cleanQ = query.trim().toLowerCase();
  const numQ = cleanQ.replace(/\D/g, "");

  // Group auditions by unique student key (studentFolio, phone or email)
  const studentMap: Record<string, AuditionRegistration[]> = {};

  auditions.forEach((aud) => {
    const key = aud.studentFolio || (aud.phone ? aud.phone.replace(/\D/g, "").slice(-10) : "") || aud.email.toLowerCase() || aud.id;
    if (!studentMap[key]) studentMap[key] = [];
    studentMap[key].push(aud);
  });

  const results = Object.values(studentMap).map((records) => {
    // Sort records by createdAt desc
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = records[0];
    return {
      candidate: {
        fullName: latest.fullName,
        phone: latest.phone,
        email: latest.email,
        studentId: latest.studentId || (latest.phone ? latest.phone.replace(/\D/g, "").slice(-10) : undefined),
        studentFolio: latest.studentFolio,
        headshotUrl: latest.headshotUrl || "",
        emergencyContactName: latest.emergencyContactName,
        emergencyContactPhone: latest.emergencyContactPhone,
        emergencyContactRelation: latest.emergencyContactRelation,
        bloodType: latest.bloodType,
        medicalNotes: latest.medicalNotes,
        vocalRange: latest.vocalRange,
        danceStyles: latest.danceStyles,
        desiredRole: latest.desiredRole,
        age: latest.age,
        birthDate: latest.birthDate,
        experienceNotes: latest.experienceNotes,
      },
      totalAuditions: records.length,
      history: records,
    };
  });

  if (!cleanQ) {
    return results;
  }

  return results.filter((item) => {
    const matchName = item.candidate.fullName.toLowerCase().includes(cleanQ);
    const matchEmail = item.candidate.email.toLowerCase().includes(cleanQ);
    const matchPhone = numQ.length > 3 && item.candidate.phone.replace(/\D/g, "").includes(numQ);
    const matchStudentFolio = item.candidate.studentFolio ? item.candidate.studentFolio.toLowerCase().includes(cleanQ) : false;
    const matchHistoryFolio = item.history.some((h) => (h.folio && h.folio.toLowerCase().includes(cleanQ)) || (h.productionCode && h.productionCode.toLowerCase().includes(cleanQ)) || (h.productionName && h.productionName.toLowerCase().includes(cleanQ)));
    return matchName || matchEmail || matchPhone || matchStudentFolio || matchHistoryFolio;
  });
}




