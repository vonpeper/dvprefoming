import React from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import AuditionLookupClient from "@/components/auditions/audition-lookup-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Consulta de Estado de Audición | DV Performing Arts",
  description: "Portal de seguimiento de audiciones y consulta de folios de aspirantes en DV Performing Arts.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuditionLookupPage() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      <SiteHeader />
      <AuditionLookupClient />
      <SiteFooter />
    </div>
  );
}
