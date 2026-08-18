"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CMSRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/articulos");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <span className="animate-spin mr-2">⏳</span> Redirigiendo a Revista & Artículos (CMS)...
    </div>
  );
}
