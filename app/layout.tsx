import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Outfit,
  Permanent_Marker,
  Rock_Salt,
  Sedgwick_Ave_Display,
  Rubik_Wet_Paint,
  Road_Rage,
} from "next/font/google";
import "./globals.css";

// 1. Text font (Clean & peaceful reading)
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// 2. Modern display font (Headings & UI elements)
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// 3. Urban Brush Options (Grotters Alternatives)
const roadRage = Road_Rage({
  variable: "--font-road-rage",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const rockSalt = Rock_Salt({
  variable: "--font-rock-salt",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const sedgwickAve = Sedgwick_Ave_Display({
  variable: "--font-sedgwick",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const rubikWetPaint = Rubik_Wet_Paint({
  variable: "--font-rubik-paint",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// [BACKUP]: Original permanent marker font preserved
const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prev.dvperformingarts.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | DV Performing Arts",
    default: "DV Performing Arts • Academia de Teatro Musical, Danza & Canto en León Gto",
  },
  description: "Formación integral en artes escénicas, teatro musical, danza urbana, canto y actuación en León, Guanajuato. Convocatoria y audiciones abiertas.",
  keywords: [
    "Teatro Musical León",
    "Clases de Canto León Gto",
    "Danza Urbana",
    "Audiciones Teatro Musical",
    "DV Performing Arts",
    "Academia de Artes Escénicas",
    "Diego Vieyra",
  ],
  authors: [{ name: "DV Performing Arts", url: siteUrl }],
  creator: "DV Performing Arts",
  publisher: "DV Performing Arts",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "DV Performing Arts",
    title: "DV Performing Arts • Academia de Teatro Musical & Danza",
    description: "Formación integral en artes escénicas en León, Gto. Disciplina, compromiso y pasión sobre el escenario.",
    images: [
      {
        url: "/images/hero/hero-stage.jpg",
        width: 1200,
        height: 630,
        alt: "DV Performing Arts Escenario",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DV Performing Arts • Academia de Teatro Musical",
    description: "Formación integral en artes escénicas en León, Gto.",
    images: ["/images/hero/hero-stage.jpg"],
  },
  icons: {
    icon: [
      { url: "/images/brand/logo-badge.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/images/brand/logo-badge.png",
    apple: "/images/brand/logo-badge.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Structured Data Schema for Local Business / Performing Arts Theater
const structuredData = {
  "@context": "https://schema.org",
  "@type": "PerformingArtsTheater",
  name: "DV Performing Arts",
  description: "Academia de formación integral en Teatro Musical, Canto, Danza Urbana y Actuación en León, Guanajuato.",
  url: siteUrl,
  telephone: "+524776558156",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Paseo de los Insurgentes #1506",
    addressLocality: "León",
    addressRegion: "Guanajuato",
    postalCode: "37160",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 21.1444,
    longitude: -101.6989,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "16:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "15:00",
    },
  ],
  sameAs: ["https://dvperformingarts.com"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`
        ${plusJakarta.variable} 
        ${outfit.variable} 
        ${roadRage.variable} 
        ${rockSalt.variable} 
        ${sedgwickAve.variable} 
        ${rubikWetPaint.variable} 
        ${permanentMarker.variable} 
        h-full antialiased
      `}
    >
      <head>
        <link rel="icon" href="/images/brand/logo-badge.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/brand/logo-badge.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
