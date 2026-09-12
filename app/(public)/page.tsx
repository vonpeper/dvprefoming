import React from "react";
import type { Metadata } from "next";

// Layout Components
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import TheatricalAuroraBackground from "@/components/ui/theatrical-aurora-background";

// Home Page Sections
import HomeHero from "@/components/home/home-hero";
import EditorialMarquee from "@/components/home/editorial-marquee";
import ManifestoSection from "@/components/home/manifesto-section";
import ProgramsSection from "@/components/home/programs-section";
import ProductionsSection from "@/components/home/productions-section";
import AuditionFeature from "@/components/home/audition-feature";
import ShowreelSection from "@/components/home/showreel-section";
import TeachersSection from "@/components/home/teachers-section";
import NewsSection from "@/components/home/news-section";
import FinalCta from "@/components/home/final-cta";
import { getLatestArticles } from "@/features/editorial/services/manifiesto";
import { getStoredWebsiteContent } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Inicio | DV Performing Arts",
  description: "Plataforma de alta fidelidad para la academia de artes escénicas DV Performing Arts en León, Guanajuato.",
};

export default async function HomePage() {
  const content = getStoredWebsiteContent();
  const articles = await getLatestArticles(5);

  return (
    <div className="flex flex-col min-h-screen bg-[#07070A] text-text-main font-sans selection:bg-accent-red selection:text-text-main relative overflow-x-hidden">
      {/* ================= THEATRICAL AURORA & STAGE LIGHTING BACKGROUND ================= */}
      <TheatricalAuroraBackground />

      {/* Dynamic Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none relative z-10">
        
        {/* Hero Section */}
        <HomeHero content={content.hero} />

        {/* Scrolling Disciplines Marquee */}
        <EditorialMarquee />

        {/* Vision & Manifesto Section */}
        <ManifestoSection content={content.manifesto} />

        {/* Program / Class Cards Section */}
        <ProgramsSection initialPrograms={content.programs} />

        {/* Shows / Production Billboard Section (Movie Poster Style) */}
        <ProductionsSection initialProductions={content.productions} />

        {/* Convocatorias / Audition Call Section */}
        <AuditionFeature />

        {/* Video / Scenic Showreel Section */}
        <ShowreelSection />

        {/* Staff / Teacher Roster Section */}
        <TeachersSection initialTeachers={content.teachers} />

        {/* Noticias & Novedades Section (5 latest articles, newest to oldest) */}
        <NewsSection initialArticles={articles} />

        {/* Call to Action Section */}
        <FinalCta contact={content.contact} />

      </main>

      {/* Footnote & Contact info */}
      <SiteFooter initialFooter={content.footer} initialContact={content.contact} />
    </div>
  );
}
