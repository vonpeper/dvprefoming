import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Permanent_Marker } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-urban-brush",
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
      className={`${plusJakarta.variable} ${outfit.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
