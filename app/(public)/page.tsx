import React from "react";
import type { Metadata } from "next";

// Layout Components
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";

// Home Page Sections
import HomeHero from "@/components/home/home-hero";
import EditorialMarquee from "@/components/home/editorial-marquee";
import ManifestoSection from "@/components/home/manifesto-section";
import ProgramsSection from "@/components/home/programs-section";
import ProductionsSection from "@/components/home/productions-section";
import AuditionFeature from "@/components/home/audition-feature";
import ShowreelSection from "@/components/home/showreel-section";
import TeachersSection from "@/components/home/teachers-section";
import EditorialSection from "@/components/home/editorial-section";
import FinalCta from "@/components/home/final-cta";
import { getLatestArticles } from "@/features/editorial/services/manifiesto";

export const metadata: Metadata = {
  title: "Inicio | DV Performing Arts",
  description: "Plataforma de alta fidelidad en desarrollo para la academia de artes escénicas DV Performing Arts en León, Guanajuato. Dirección visual: Backstage Editorial.",
};

export default async function HomePage() {
  const articles = await getLatestArticles();

  return (
    <div className="flex flex-col min-h-screen bg-background-main text-text-main font-sans selection:bg-accent-red selection:text-text-main">
      {/* Dynamic Header */}
      <SiteHeader />

      {/* Main Content Area (supports accessibility skip link target) */}
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none">
        
        {/* Hero Section */}
        <HomeHero />

        {/* Scrolling Disciplines Marquee */}
        <EditorialMarquee />

        {/* Vision & Manifesto Section */}
        <ManifestoSection />

        {/* Program / Class Cards Section */}
        <ProgramsSection />

        {/* Shows / Production Billboard Section */}
        <ProductionsSection />

        {/* Convocatorias / Audition Call Section */}
        <AuditionFeature />

        {/* Video / Scenic Showreel Section */}
        <ShowreelSection />

        {/* Staff / Teacher Roster Section */}
        <TeachersSection />

        {/* Blog / Manifiesto 21 Revista Section */}
        <EditorialSection articles={articles} />

        {/* Call to Action Section */}
        <FinalCta />

      </main>

      {/* Footnote & Contact info */}
      <SiteFooter />
    </div>
  );
}
