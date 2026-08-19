import React from "react";
import FloatingWhatsApp from "@/components/ui/floating-whatsapp";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Static Floating WhatsApp Bubble Button */}
      <FloatingWhatsApp />
    </>
  );
}
