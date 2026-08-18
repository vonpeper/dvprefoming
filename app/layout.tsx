import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | DV Performing Arts",
    default: "DV Performing Arts (Base Técnica)",
  },
  description: "Plataforma en desarrollo para la academia de artes escénicas DV Performing Arts en León, Guanajuato.",
  robots: {
    index: process.env.SITE_INDEXING_ENABLED === "true",
    follow: process.env.SITE_INDEXING_ENABLED === "true",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
