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

export const metadata: Metadata = {
  title: {
    template: "%s | DV Performing Arts",
    default: "DV Performing Arts • Academia de Teatro Musical & Danza",
  },
  description: "Formación integral en artes escénicas, teatro musical, danza urbana y técnica vocal en León, Guanajuato.",
  robots: {
    index: process.env.SITE_INDEXING_ENABLED === "true",
    follow: process.env.SITE_INDEXING_ENABLED === "true",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
